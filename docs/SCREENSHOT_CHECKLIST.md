# Checklist Ảnh Chụp Cho Báo Cáo

## Kiến Trúc Và Docker

- Màn hình `docker compose ps` cho thấy container chạy.
- Docker Desktop danh sách container.
- File `docker-compose.yml` phần `restart`, `healthcheck`.

## Eureka

- Dashboard `http://localhost:8761`.
- Các service đã đăng ký:
  - API-GATEWAY
  - USER-SERVICE
  - PRODUCT-SERVICE
  - ORDER-SERVICE
  - INVENTORY-SERVICE

## Frontend User

- Trang chủ.
- Trang danh sách sản phẩm.
- Trang chi tiết sản phẩm.
- Giỏ hàng.
- Checkout.
- Lịch sử đơn hàng.
- Trang tin tức.
- Trang chi tiết tin tức.

## Frontend Admin

- Admin dashboard.
- Quản lý sản phẩm.
- Modal thêm/sửa sản phẩm.
- Upload ảnh sản phẩm.
- Quản lý tồn kho.
- Quản lý đơn hàng.
- Quản lý người dùng.
- Quản lý tin tức.

## JWT Security

- Màn hình đăng nhập.
- Response login có token bằng Postman/curl.
- LocalStorage có token và role.
- Admin vào được `/admin`, user thường không vào được.

## Redis Cache

- Code `@Cacheable("products")`.
- Code `@CacheEvict`.
- Log Product Service lần đầu đọc MySQL.
- Lệnh `redis-cli KEYS *` nếu cần minh chứng cache.

## MongoDB

- `mongosh order_event_db`.
- `db.order_event_logs.find().pretty()`.
- Event `ORDER_CREATED`, `STOCK_CONFIRMED`, `STOCK_REJECTED`.

## RabbitMQ

- Dashboard RabbitMQ `http://localhost:15672`.
- Queue/exchange liên quan order/inventory.
- Log Inventory Service nhận message.

## API Gateway Và Rate Limiting

- File `api-gateway/application.properties` phần routes.
- File cấu hình `RequestRateLimiter`.
- Response API có header `X-RateLimit-*`.
