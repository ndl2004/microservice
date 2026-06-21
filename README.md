# E-Commerce Microservices với Spring Boot

Đây là dự án E-Commerce theo kiến trúc Microservices, xây dựng bằng Spring Boot và React để phục vụ đồ án môn Chuyên đề Lập trình Web 2. Dự án có đầy đủ các thành phần chính: API Gateway, Eureka Service Discovery, JWT Authentication, OpenFeign, RabbitMQ, Redis cache, MongoDB event log, MySQL và Docker Compose.

## Mục tiêu dự án

Hệ thống mô phỏng luồng mua hàng cơ bản:

```text
Đăng ký
-> Đăng nhập nhận JWT
-> Xem sản phẩm
-> Thêm vào giỏ hàng
-> Tạo đơn hàng
-> Order Service gửi yêu cầu kiểm tra tồn kho qua RabbitMQ
-> Inventory Service xác nhận hoặc từ chối tồn kho
-> Order Service cập nhật trạng thái đơn hàng
-> MongoDB lưu lịch sử sự kiện đơn hàng
-> Redis cache danh sách sản phẩm
```

## Công nghệ sử dụng

Backend:

- Java 21
- Spring Boot 3.3.5
- Spring Data JPA
- Spring Security
- JWT Authentication
- Spring Cloud Gateway
- Netflix Eureka Server
- OpenFeign
- RabbitMQ
- Redis
- MongoDB
- MySQL
- Docker và Docker Compose

Frontend:

- React
- Vite
- Axios
- React Router
- Context API

## Kiến trúc hệ thống

```text
React Frontend
localhost:5173
      |
      v
API Gateway
localhost:8088
      |
      +--> User Service      :8082
      +--> Product Service   :8081 --> Redis
      +--> Order Service     :8083 --> MongoDB
      +--> Inventory Service :8084

Order Service <--> RabbitMQ <--> Inventory Service
Các service đăng ký vào Eureka Server tại localhost:8761
```

## Cấu trúc thư mục

```text
microservice/
├── api-gateway/
├── eureka-server/
├── user-service/
├── product-service/
├── order-service/
├── inventory-service/
├── frontend-web/
├── docker-compose.yml
├── pom.xml
└── LAB6_REDIS_MONGODB_GUIDE.md
```

## Các service

### Eureka Server

Thư mục: `eureka-server`

Chức năng:

- Service Discovery
- Cho phép các service tự đăng ký
- Giúp Gateway và các service tìm nhau bằng service name

Port:

```text
8761
```

Dashboard:

```text
http://localhost:8761
```

### API Gateway

Thư mục: `api-gateway`

Chức năng:

- Điểm vào duy nhất cho frontend
- Routing request tới các service
- Cấu hình CORS cho React frontend

Base URL:

```text
http://localhost:8088/api
```

Routes:

```text
/api/auth/**       -> user-service
/api/users/**      -> user-service
/api/products/**   -> product-service
/api/categories/** -> product-service
/api/brands/**     -> product-service
/api/orders/**     -> order-service
/api/inventory/**  -> inventory-service
```

### User Service

Thư mục: `user-service`

Chức năng:

- Quản lý người dùng
- Đăng ký
- Đăng nhập
- Sinh JWT token
- Bảo vệ API `/users/**`

API chính:

```text
POST /auth/register
POST /auth/login
GET  /users
GET  /users/{id}
```

### Product Service

Thư mục: `product-service`

Chức năng:

- Quản lý sản phẩm
- Quản lý danh mục
- Quản lý thương hiệu
- Cache danh sách sản phẩm bằng Redis

API chính:

```text
GET  /products
GET  /products/{id}
POST /products
GET  /categories
GET  /brands
```

Redis cache được áp dụng trong `ProductController`:

```java
@Cacheable("products")
@GetMapping
public List<Product> getAll()
```

Khi thêm sản phẩm mới, cache được xóa bằng:

```java
@CacheEvict(value = "products", allEntries = true)
```

### Order Service

Thư mục: `order-service`

Chức năng:

- Tạo đơn hàng
- Gọi Product Service bằng OpenFeign
- Gọi User Service bằng OpenFeign
- Lưu đơn hàng và chi tiết đơn hàng vào MySQL
- Gửi yêu cầu kiểm tra tồn kho qua RabbitMQ
- Nhận kết quả tồn kho từ Inventory Service
- Ghi event log vào MongoDB

API chính:

```text
GET  /orders
GET  /orders/{id}
GET  /orders/user/{userId}
POST /orders
PUT  /orders/{id}/cancel
GET  /orders/events
GET  /orders/{id}/events
```

### Inventory Service

Thư mục: `inventory-service`

Chức năng:

- Quản lý tồn kho
- Nhận message kiểm tra tồn kho từ RabbitMQ
- Trừ tồn kho nếu đủ hàng
- Gửi kết quả về Order Service

API chính:

```text
GET  /inventory
GET  /inventory/{productId}
POST /inventory/decrease
```

## Database và hạ tầng

### MySQL

MySQL lưu dữ liệu nghiệp vụ chính:

- User
- Product
- Category
- Brand
- Order
- Order Item
- Inventory

Các service đang dùng MySQL trên máy host:

```text
jdbc:mysql://host.docker.internal:3307/user_db
jdbc:mysql://host.docker.internal:3307/product_db
jdbc:mysql://host.docker.internal:3307/order_db
jdbc:mysql://host.docker.internal:3307/inventory_db
```

Tài khoản mặc định:

```text
root / root
```

Cần tạo trước các database:

```sql
CREATE DATABASE user_db;
CREATE DATABASE product_db;
CREATE DATABASE order_db;
CREATE DATABASE inventory_db;
```

Các bảng được tạo tự động nhờ:

```properties
spring.jpa.hibernate.ddl-auto=update
```

### Redis

Redis dùng để cache danh sách sản phẩm trong `product-service`.

Container:

```text
redis-microservice
```

Port:

```text
6379
```

Ý nghĩa:

- Lần đầu gọi `GET /api/products`: đọc từ MySQL
- Các lần sau: đọc từ Redis cache
- Khi thêm sản phẩm: xóa cache để cập nhật dữ liệu mới

### MongoDB

MongoDB dùng để lưu lịch sử sự kiện đơn hàng trong `order-service`.

Container:

```text
mongodb-microservice
```

Database:

```text
order_event_db
```

Collection:

```text
order_event_logs
```

Các event chính:

```text
ORDER_CREATED
STOCK_CONFIRMED
STOCK_REJECTED
```

Code chính:

```text
order-service/src/main/java/com/example/order/event/OrderEventLog.java
order-service/src/main/java/com/example/order/event/OrderEventLogRepository.java
order-service/src/main/java/com/example/order/event/OrderEventLogService.java
```

### RabbitMQ

RabbitMQ dùng cho giao tiếp bất đồng bộ giữa Order Service và Inventory Service.

Container:

```text
rabbitmq-microservice
```

Dashboard:

```text
http://localhost:15672
```

Tài khoản mặc định:

```text
guest / guest
```

Luồng message:

```text
Order Service tạo đơn hàng
-> gửi StockRequest vào RabbitMQ
-> Inventory Service nhận message
-> kiểm tra tồn kho
-> gửi StockResultEvent về RabbitMQ
-> Order Service cập nhật trạng thái
-> Order Service ghi event log vào MongoDB
```

## Bảng port

| Thành phần | Port |
|---|---:|
| Frontend React | 5173 |
| API Gateway | 8088 |
| Eureka Server | 8761 |
| Product Service | 8081 |
| User Service | 8082 |
| Order Service | 8083 |
| Inventory Service | 8084 |
| RabbitMQ | 5672 |
| RabbitMQ Dashboard | 15672 |
| Redis | 6379 |
| MongoDB | 27017 |
| phpMyAdmin | 8089 |
| MySQL host | 3307 |

## Cách chạy dự án

### 1. Build backend

Tại thư mục gốc:

```powershell
mvn.cmd -q -DskipTests package
```

Nếu chỉ muốn build nhanh phần Lab 6:

```powershell
mvn.cmd -q -pl product-service,order-service -am -DskipTests package
```

### 2. Chạy Docker Compose

```powershell
docker compose up -d --build
```

Kiểm tra container:

```powershell
docker compose ps
```

### 3. Chạy frontend

```powershell
cd frontend-web
npm install
npm run dev
```

Frontend chạy tại:

```text
http://localhost:5173
```

## Một số API test nhanh

### Đăng ký

```powershell
$body = @{
  fullName = "Nguyen Van A"
  email = "user@example.com"
  password = "123456"
  phone = "0901234567"
  address = "TP. Ho Chi Minh"
} | ConvertTo-Json

Invoke-RestMethod `
  -Method POST `
  -Uri "http://localhost:8088/api/auth/register" `
  -ContentType "application/json" `
  -Body $body
```

### Đăng nhập

```powershell
$body = @{
  email = "user@example.com"
  password = "123456"
} | ConvertTo-Json

Invoke-RestMethod `
  -Method POST `
  -Uri "http://localhost:8088/api/auth/login" `
  -ContentType "application/json" `
  -Body $body
```

### Lấy danh sách sản phẩm

```powershell
Invoke-RestMethod -Method GET -Uri "http://localhost:8088/api/products"
```

### Tạo đơn hàng

```powershell
$body = @{
  userId = 1
  fullName = "Nguyen Van A"
  phone = "0901234567"
  address = "TP. Ho Chi Minh"
  note = "Giao gio hanh chinh"
  paymentMethod = "cod"
  items = @(
    @{
      productId = 1
      quantity = 1
    }
  )
} | ConvertTo-Json -Depth 5

Invoke-RestMethod `
  -Method POST `
  -Uri "http://localhost:8088/api/orders" `
  -ContentType "application/json" `
  -Body $body
```

## Demo Lab 6: Redis và MongoDB

Chi tiết nằm trong:

```text
LAB6_REDIS_MONGODB_GUIDE.md
```

### Demo Redis cache

Gọi API sản phẩm lần đầu:

```powershell
Invoke-RestMethod -Method GET -Uri "http://localhost:8088/api/products"
```

Xem log:

```powershell
docker logs product-service --tail 50
```

Lần đầu sẽ thấy log đọc từ MySQL. Gọi lại API lần thứ hai, nếu cache hoạt động thì không in thêm log đọc MySQL.

Kiểm tra key Redis:

```powershell
docker exec -it redis-microservice redis-cli KEYS "*"
```

### Demo MongoDB event log

Sau khi tạo đơn hàng, xem event log qua API:

```powershell
Invoke-RestMethod -Method GET -Uri "http://localhost:8088/api/orders/events"
```

Hoặc kiểm tra trực tiếp trong MongoDB:

```powershell
docker exec -it mongodb-microservice mongosh order_event_db
```

Trong `mongosh`:

```javascript
db.order_event_logs.find().pretty()
```

Document mong muốn có các trường:

```text
orderId
userId
eventType
message
createdAt
payload
```

## Authentication

User Service dùng JWT.

Luồng xác thực:

```text
POST /api/auth/register
-> POST /api/auth/login
-> nhận token
-> frontend lưu token vào localStorage
-> Axios tự gắn Authorization: Bearer token
```

File cấu hình Axios:

```text
frontend-web/src/api/axios.js
```

## Kịch bản thuyết trình đề xuất

1. Mở `docker-compose.yml` để giới thiệu Eureka, Gateway, RabbitMQ, Redis, MongoDB và các service.
2. Mở Eureka Dashboard tại `http://localhost:8761`.
3. Gọi `GET /api/products` hai lần để demo Redis cache.
4. Mở `ProductController` để chỉ ra `@Cacheable` và `@CacheEvict`.
5. Tạo đơn hàng mới từ frontend hoặc Postman.
6. Giải thích luồng Order Service -> RabbitMQ -> Inventory Service.
7. Mở MongoDB bằng `mongosh`.
8. Chạy `db.order_event_logs.find().pretty()` để chứng minh event log đã được lưu.
9. Kết luận: MySQL lưu nghiệp vụ chính, Redis tối ưu dữ liệu đọc nhiều, MongoDB lưu event log dạng document.

## Ghi chú

- Dự án dùng MySQL ngoài Docker qua `host.docker.internal:3307`.
- Redis, MongoDB và RabbitMQ chạy bằng Docker Compose.
- `restart: always` đã được cấu hình trong `docker-compose.yml`.
- API Gateway đã cấu hình CORS cho frontend tại `localhost:5173`.
- Frontend gọi API qua `http://localhost:8088/api`.

## Tác giả

Dự án được xây dựng phục vụ học phần Chuyên đề Lập trình Web 2, theo hướng E-Commerce Microservices với Spring Boot và React.
