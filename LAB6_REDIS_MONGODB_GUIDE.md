# LAB 6 - Redis và MongoDB trong Microservice

## 1. Chức năng đã áp dụng trong dự án

### Redis

`product-service` dùng Redis để cache danh sách sản phẩm.

- API demo: `GET http://localhost:8088/api/products`
- Code chính: `ProductController#getAll()`
- Annotation: `@Cacheable("products")`
- Khi thêm sản phẩm mới: `@CacheEvict(value = "products", allEntries = true)`

Ý nghĩa: lần đầu đọc sản phẩm từ MySQL, các lần sau đọc từ Redis để giảm tải database.

### MongoDB

`order-service` dùng MongoDB để lưu log sự kiện đơn hàng.

- Collection: `order_event_logs`
- Database: `order_event_db`
- API xem log:
  - `GET http://localhost:8088/api/orders/events`
  - `GET http://localhost:8088/api/orders/{orderId}/events`

Các event được lưu:

- `ORDER_CREATED`: tạo đơn hàng thành công, đang chờ kiểm tra tồn kho.
- `STOCK_CONFIRMED`: Inventory Service xác nhận còn hàng.
- `STOCK_REJECTED`: Inventory Service báo không đủ hàng.

Ý nghĩa: MySQL lưu dữ liệu nghiệp vụ chính của order, MongoDB lưu lịch sử sự kiện linh hoạt dạng document.

## 2. Chạy lại hệ thống

Từ thư mục `microservice`:

```powershell
mvn.cmd -q -pl product-service,order-service -am -DskipTests package
docker compose up -d --build
docker compose ps
```

Nếu chỉ muốn rebuild nhanh các service liên quan Lab 6:

```powershell
docker compose up -d --build redis mongodb product-service order-service api-gateway
```

## 3. Test Redis cache

Gọi API sản phẩm lần 1:

```powershell
Invoke-RestMethod -Method GET -Uri "http://localhost:8088/api/products"
```

Xem log `product-service`:

```powershell
docker logs product-service --tail 50
```

Lần đầu sẽ thấy log:

```text
Dang doc du lieu tu MySQL...
```

Gọi lại API lần 2:

```powershell
Invoke-RestMethod -Method GET -Uri "http://localhost:8088/api/products"
```

Nếu cache hoạt động, lần 2 không in thêm dòng `Dang doc du lieu tu MySQL...` vì dữ liệu đã được lấy từ Redis.

Kiểm tra key trong Redis:

```powershell
docker exec -it redis-microservice redis-cli KEYS "*"
```

## 4. Test MongoDB event log

Tạo đơn hàng qua API Gateway. Thay `userId` và `productId` bằng ID thật trong database của bạn:

```powershell
$body = @{
  userId = 1
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

Xem toàn bộ log sự kiện đơn hàng trong MongoDB qua API:

```powershell
Invoke-RestMethod -Method GET -Uri "http://localhost:8088/api/orders/events"
```

Xem log theo một đơn hàng cụ thể:

```powershell
Invoke-RestMethod -Method GET -Uri "http://localhost:8088/api/orders/1/events"
```

Kiểm tra trực tiếp trong MongoDB container:

```powershell
docker exec -it mongodb-microservice mongosh order_event_db
```

Trong `mongosh`:

```javascript
db.order_event_logs.find().pretty()
```

Kết quả mong muốn: có document chứa `orderId`, `userId`, `eventType`, `message`, `createdAt`, `payload`.

## 5. Kịch bản trình bày với giảng viên

1. Mở `docker-compose.yml` và chỉ ra có `redis` + `mongodb`.
2. Mở `ProductController` và chỉ ra `@Cacheable("products")`.
3. Gọi `/api/products` hai lần, giải thích lần đầu vào MySQL, lần sau lấy Redis.
4. Mở `OrderController` và `OrderConsumer`, chỉ ra chỗ lưu `OrderEventLog`.
5. Tạo một đơn hàng mới.
6. Gọi `/api/orders/events` hoặc mở `mongosh` để chứng minh MongoDB đã lưu event.

## 6. Trả lời câu hỏi Lab 6

### 1. Redis giải quyết vấn đề gì trong Microservice?

Redis giúp cache dữ liệu được đọc nhiều, giảm số lần truy vấn MySQL hoặc gọi sang service khác. Trong dự án này, Redis cache danh sách sản phẩm ở `product-service`, giúp API sản phẩm phản hồi nhanh hơn và giảm tải database.

### 2. Vì sao Redis nhanh hơn MySQL?

Redis lưu dữ liệu chủ yếu trong RAM và truy xuất theo kiểu key-value, nên rất nhanh cho thao tác đọc/ghi đơn giản. MySQL lưu dữ liệu quan hệ trên disk, có SQL parser, transaction, join, index và constraint nên mạnh về tính toàn vẹn dữ liệu nhưng thường chậm hơn Redis cho cache.

### 3. Khi nào nên dùng Cache?

Nên dùng cache cho dữ liệu đọc nhiều, ít thay đổi, hoặc có thể chấp nhận trễ cập nhật ngắn. Ví dụ: danh sách sản phẩm, chi tiết sản phẩm, danh mục, cấu hình hệ thống. Không nên cache dữ liệu yêu cầu chính xác tức thời như trạng thái thanh toán realtime hoặc tồn kho nhạy cảm nếu không có chiến lược đồng bộ rõ ràng.

### 4. MongoDB khác MySQL ở điểm nào?

MySQL là cơ sở dữ liệu quan hệ, lưu dữ liệu theo bảng, cột, khóa chính, khóa ngoại và phù hợp dữ liệu có cấu trúc chặt. MongoDB là NoSQL document database, lưu dữ liệu dạng JSON/BSON linh hoạt, phù hợp log, event, lịch sử thao tác hoặc dữ liệu có cấu trúc thay đổi thường xuyên.
