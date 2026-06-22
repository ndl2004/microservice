# Checklist Yêu Cầu Cuối Kỳ

| STT | Yêu cầu | Trạng thái | Minh chứng trong dự án |
|---:|---|---|---|
| 1 | Spring Boot | Đã có | `user-service`, `product-service`, `order-service`, `inventory-service`, `api-gateway`, `eureka-server` |
| 2 | Microservices | Đã có | Các service tách riêng theo nghiệp vụ |
| 3 | Frontend | Đã có | `frontend-web` dùng React Vite |
| 4 | SQL Database | Đã có | MySQL lưu user, product, order, inventory |
| 5 | NoSQL | Đã có | Redis cache, MongoDB event log |
| 6 | JWT Security | Đã có | User Service đăng nhập, sinh JWT, phân quyền admin |
| 7 | Load Balancing & Scaling | Đã có | Eureka Server và Spring Cloud Gateway |
| 8 | Giao tiếp đồng bộ | Đã có | OpenFeign trong Order Service gọi User/Product |
| 9 | Giao tiếp bất đồng bộ | Đã có | RabbitMQ giữa Order Service và Inventory Service |
| 10 | Logging & Error Handling | Đã có cơ bản | SLF4J và Global Exception Handler |
| 11 | Rate Limiting | Đã có | API Gateway dùng Redis RequestRateLimiter |
| 12 | Caching | Đã có | Redis cache danh sách sản phẩm |
| 13 | Availability & Recovery | Đã có | `restart: always`, `healthcheck`, `depends_on: service_healthy` |
| 14 | Docker | Đã có | `docker-compose.yml` container hóa hệ thống |
| 15 | Cloud & Compute | Chưa làm | Đây là phần gợi ý, có thể nêu là hướng phát triển |
| 16 | Báo cáo, Demo, Phản biện | Đang chuẩn bị | Tài liệu trong thư mục `docs/` |

## Nhận Xét

Dự án đã đáp ứng phần lớn yêu cầu trọng tâm. Phần Cloud & Compute có thể không triển khai nếu thời gian hạn chế, nhưng nên trình bày trong mục hướng phát triển.

## Phần Nên Nhấn Mạnh Khi Báo Cáo

- Kiến trúc có nhiều service thật, không chỉ chia package.
- Gateway là điểm vào duy nhất cho frontend.
- Eureka giúp các service tìm nhau bằng service name.
- OpenFeign thể hiện giao tiếp đồng bộ.
- RabbitMQ thể hiện giao tiếp bất đồng bộ.
- Redis giải quyết bài toán cache dữ liệu đọc nhiều.
- MongoDB phù hợp lưu event log dạng document.
- Docker Compose giúp triển khai toàn hệ thống.
