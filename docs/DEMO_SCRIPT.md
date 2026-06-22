# Kịch Bản Demo

## Chuẩn Bị Trước Khi Demo

1. Chạy backend và hạ tầng:

```powershell
docker compose up -d --build
docker compose ps
```

2. Chạy frontend:

```powershell
cd frontend-web
npm run dev
```

3. Mở các trang hỗ trợ:

```text
Frontend: http://localhost:5173
Eureka: http://localhost:8761
RabbitMQ: http://localhost:15672
phpMyAdmin: http://localhost:8089
```

## Tài Khoản Demo

Admin:

```text
admin@example.com
123456
```

User thường: đăng ký mới trên giao diện.

## Demo Luồng Người Dùng

1. Mở trang chủ frontend.
2. Vào trang sản phẩm.
3. Xem chi tiết một sản phẩm.
4. Đăng ký tài khoản user mới.
5. Đăng nhập để nhận JWT.
6. Thêm sản phẩm vào giỏ hàng.
7. Vào checkout.
8. Tạo đơn hàng COD.
9. Kiểm tra trạng thái đơn hàng.

Điểm cần nói:

- Frontend gọi API qua Gateway `localhost:8088`.
- JWT được lưu ở frontend và gửi trong header `Authorization`.
- Order Service tạo đơn hàng và gửi message sang RabbitMQ.
- Inventory Service xử lý tồn kho bất đồng bộ.

## Demo Admin

1. Đăng nhập admin.
2. Vào `/admin/products`.
3. Thêm, sửa, xem chi tiết, xóa sản phẩm.
4. Upload ảnh sản phẩm.
5. Vào `/admin/inventory`.
6. Cập nhật tồn kho, tăng giảm số lượng.
7. Vào `/admin/orders`.
8. Xem đơn hàng.
9. Vào `/admin/news`.
10. Thêm bài viết, đổi trạng thái đăng/ẩn.
11. Mở `/tin-tuc` để thấy bài viết hiển thị ngoài frontend.

## Demo Redis Cache

1. Gọi API sản phẩm lần đầu:

```powershell
curl.exe http://localhost:8088/api/products
```

2. Xem log Product Service:

```powershell
docker compose logs --tail=80 product-service
```

3. Giải thích:

- Lần đầu Product Service đọc MySQL và lưu cache Redis.
- Các lần sau dữ liệu được lấy từ Redis.
- Khi thêm/sửa/xóa sản phẩm qua API, cache được xóa bằng `@CacheEvict`.

Nếu thêm sản phẩm bằng SQL trực tiếp, chạy:

```powershell
docker exec redis-microservice redis-cli FLUSHALL
```

## Demo MongoDB Event Log

Sau khi tạo đơn hàng, kiểm tra event log:

```powershell
docker exec -it mongodb-microservice mongosh order_event_db
```

Trong mongosh:

```javascript
db.order_event_logs.find().pretty()
```

Hoặc xem event của một đơn hàng:

```javascript
db.order_event_logs.find({ orderId: 35 }).pretty()
```

Điểm cần nói:

- MongoDB lưu lịch sử sự kiện đơn hàng.
- Dạng document phù hợp vì payload event linh hoạt.

## Demo RabbitMQ

Mở:

```text
http://localhost:15672
```

Tài khoản mặc định thường là:

```text
guest / guest
```

Điểm cần nói:

- Order Service gửi message kiểm tra tồn kho.
- Inventory Service nhận message và xử lý.
- Đây là giao tiếp bất đồng bộ, giúp Order Service không phụ thuộc trực tiếp vào thời gian xử lý tồn kho.

## Demo Eureka

Mở:

```text
http://localhost:8761
```

Kiểm tra các service đã đăng ký:

- API-GATEWAY
- USER-SERVICE
- PRODUCT-SERVICE
- ORDER-SERVICE
- INVENTORY-SERVICE

## Demo Availability & Recovery

Chạy:

```powershell
docker compose ps
```

Điểm cần nói:

- Các container có `restart: always`.
- Docker Compose có `healthcheck`.
- Gateway chỉ khởi động sau khi các service chính healthy.
