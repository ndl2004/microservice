# Dàn Ý Báo Cáo Và Slide

## 1. Giới Thiệu Đề Tài

- Tên đề tài: Xây dựng hệ thống E-Commerce theo kiến trúc Microservices.
- Mục tiêu: mô phỏng quy trình bán hàng online có frontend, backend, database, bảo mật, giao tiếp giữa service và Docker deployment.
- Lý do chọn Microservices: dễ mở rộng, tách nghiệp vụ, dễ bảo trì, phù hợp hệ thống thương mại điện tử.

## 2. Công Nghệ Sử Dụng

- Spring Boot cho backend.
- React Vite cho frontend.
- MySQL cho dữ liệu nghiệp vụ chính.
- Redis cho cache.
- MongoDB cho event log.
- RabbitMQ cho giao tiếp bất đồng bộ.
- Eureka và API Gateway cho service discovery và routing.
- JWT cho authentication.
- Docker Compose cho triển khai.

## 3. Kiến Trúc Hệ Thống

Nên đưa sơ đồ từ README vào slide:

```text
React -> API Gateway -> User/Product/Order/Inventory
Order -> RabbitMQ -> Inventory
Product -> Redis
Order -> MongoDB
Services -> Eureka
Services -> MySQL
```

Giải thích:

- API Gateway là điểm vào duy nhất.
- Eureka quản lý danh sách service.
- User Service quản lý tài khoản và JWT.
- Product Service quản lý sản phẩm và cache.
- Order Service xử lý đơn hàng.
- Inventory Service xử lý tồn kho.

## 4. Thiết Kế Cơ Sở Dữ Liệu

MySQL:

- `users`
- `product`
- `categories`
- `brands`
- `orders`
- `order_items`
- `inventory`

Redis:

- Cache danh sách sản phẩm.

MongoDB:

- Database: `order_event_db`
- Collection: `order_event_logs`

## 5. Bảo Mật

- Người dùng đăng nhập bằng email/password.
- Backend trả JWT token.
- Frontend gửi token qua header `Authorization: Bearer ...`.
- Admin được phân quyền bằng `role = ADMIN`.

## 6. Giao Tiếp Giữa Service

Đồng bộ:

- Order Service gọi Product Service bằng OpenFeign.
- Order Service gọi User Service bằng OpenFeign.

Bất đồng bộ:

- Order Service gửi message qua RabbitMQ.
- Inventory Service nhận message, kiểm tra tồn kho.
- Inventory Service gửi kết quả lại để Order Service cập nhật trạng thái.

## 7. Redis Cache

- Product Service cache danh sách sản phẩm.
- Lần đầu đọc từ MySQL.
- Các lần sau đọc từ Redis.
- Khi thêm/sửa/xóa sản phẩm, cache được xóa.

## 8. MongoDB Event Log

- Lưu lịch sử sự kiện đơn hàng.
- Ví dụ event:
  - `ORDER_CREATED`
  - `STOCK_CONFIRMED`
  - `STOCK_REJECTED`
- Lý do dùng MongoDB: event payload linh hoạt, phù hợp dữ liệu document.

## 9. Logging, Error Handling, Rate Limiting

- Logging bằng SLF4J.
- Global Exception Handler trả lỗi JSON thống nhất.
- API Gateway có Redis Rate Limiter để giới hạn số request.

## 10. Docker, Availability Và Recovery

- Docker Compose chạy toàn bộ hệ thống.
- `restart: always` giúp container tự khởi động lại.
- `healthcheck` giúp Docker biết service đã sẵn sàng.
- `depends_on: service_healthy` giảm lỗi gọi service quá sớm.

## 11. Demo

Kịch bản demo:

1. Eureka dashboard.
2. Đăng ký/đăng nhập.
3. Xem sản phẩm.
4. Thêm giỏ hàng.
5. Checkout.
6. Xem đơn hàng.
7. Xem RabbitMQ.
8. Xem MongoDB event log.
9. Xem Redis cache hoặc log Product Service.
10. Admin quản lý sản phẩm/tồn kho/tin tức.

## 12. Hạn Chế

- News hiện được quản lý ở frontend/localStorage, chưa tách thành news-service riêng.
- Chưa triển khai cloud.
- Chưa có monitoring chuyên sâu như Prometheus/Grafana.

## 13. Hướng Phát Triển

- Tách News Service riêng.
- Thêm Payment Service.
- Thêm Notification Service gửi email.
- Thêm Monitoring bằng Prometheus/Grafana.
- Triển khai cloud bằng Render, Railway, AWS hoặc Azure.
- Thêm CI/CD với GitHub Actions.

## 14. Câu Hỏi Phản Biện Có Thể Gặp

### Vì sao dùng Redis?

Vì danh sách sản phẩm là dữ liệu đọc nhiều, ít thay đổi hơn so với đơn hàng. Cache giúp giảm truy vấn MySQL.

### Vì sao dùng MongoDB?

Vì event log có payload linh hoạt. MongoDB lưu document phù hợp hơn bảng quan hệ cứng.

### Vì sao dùng RabbitMQ?

Vì kiểm tra tồn kho có thể xử lý bất đồng bộ. Order Service không cần chờ trực tiếp Inventory Service xử lý xong trong cùng một request.

### Vì sao cần Eureka?

Vì các service có thể tìm nhau bằng tên service thay vì hard-code địa chỉ IP/port.

### Vì sao cần Gateway?

Gateway giúp frontend chỉ gọi một địa chỉ duy nhất, đồng thời xử lý routing, CORS và rate limiting.
