# API Test Guide

Base URL:

```text
http://localhost:8088/api
```

## Auth

Đăng ký:

```powershell
curl.exe -X POST http://localhost:8088/api/auth/register `
  -H "Content-Type: application/json" `
  -d "{\"fullName\":\"Nguyen Van A\",\"email\":\"userdemo@example.com\",\"password\":\"123456\",\"phone\":\"0901234567\",\"address\":\"TP HCM\"}"
```

Đăng nhập:

```powershell
curl.exe -X POST http://localhost:8088/api/auth/login `
  -H "Content-Type: application/json" `
  -d "{\"email\":\"admin@example.com\",\"password\":\"123456\"}"
```

Kết quả mong đợi:

- Trả về `token`.
- Trả về `role` là `ADMIN` với tài khoản admin.

## Product

Danh sách sản phẩm:

```powershell
curl.exe http://localhost:8088/api/products
```

Chi tiết sản phẩm:

```powershell
curl.exe http://localhost:8088/api/products/1
```

Danh mục:

```powershell
curl.exe http://localhost:8088/api/categories
```

Thương hiệu:

```powershell
curl.exe http://localhost:8088/api/brands
```

## Inventory

Danh sách tồn kho:

```powershell
curl.exe http://localhost:8088/api/inventory
```

Cập nhật tồn kho sản phẩm:

```powershell
curl.exe -X PUT http://localhost:8088/api/inventory/1 `
  -H "Content-Type: application/json" `
  -d "{\"productId\":1,\"quantity\":50}"
```

## Order

Tạo đơn hàng:

```powershell
curl.exe -X POST http://localhost:8088/api/orders `
  -H "Content-Type: application/json" `
  -d "{\"userId\":1,\"fullName\":\"Nguyen Van A\",\"phone\":\"0901234567\",\"address\":\"TP HCM\",\"note\":\"Demo dat hang\",\"paymentMethod\":\"cod\",\"items\":[{\"productId\":1,\"quantity\":1}]}"
```

Danh sách đơn hàng:

```powershell
curl.exe http://localhost:8088/api/orders
```

Event log đơn hàng:

```powershell
curl.exe http://localhost:8088/api/orders/35/events
```

## News

Danh sách bài viết:

```powershell
curl.exe http://localhost:8088/api/news
```

Danh sách bài viết đã đăng:

```powershell
curl.exe "http://localhost:8088/api/news?status=PUBLISHED"
```

Tạo bài viết:

```powershell
curl.exe -X POST http://localhost:8088/api/news `
  -H "Content-Type: application/json" `
  -d "{\"title\":\"Tin demo\",\"category\":\"company_news\",\"summary\":\"Mo ta ngan\",\"content\":\"Noi dung bai viet demo\",\"author\":\"Admin\",\"status\":\"PUBLISHED\",\"date\":\"2026-06-22\"}"
```

## Docker Và Log

Trạng thái container:

```powershell
docker compose ps
```

Log Gateway:

```powershell
docker compose logs --tail=100 api-gateway
```

Log Product:

```powershell
docker compose logs --tail=100 product-service
```

Log Order:

```powershell
docker compose logs --tail=100 order-service
```

Log Inventory:

```powershell
docker compose logs --tail=100 inventory-service
```
