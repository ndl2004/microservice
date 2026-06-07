# 🚀 Microservices Architecture Project

Dự án này là một hệ thống được xây dựng trên kiến trúc **Microservices** sử dụng hệ sinh thái **Spring Cloud** (Java) và được đóng gói, triển khai bằng **Docker**. Dự án hiện đang trong quá trình phát triển tích cực (Work In Progress).

---

## 🛠️ Công nghệ sử dụng

* **Backend:** Java 17+, Spring Boot, Spring Cloud
* **Service Discovery:** Netflix Eureka Server
* **API Gateway:** Spring Cloud Gateway
* **DevOps & Deployment:** Docker, Dockerfile

---

## 🏗️ Kiến trúc hệ thống & Trạng thái dự án

Hệ thống được chia thành các dịch vụ độc lập nhằm tối ưu khả năng mở rộng:

| Tên Service | Chức năng | Trạng thái |
| :--- | :--- | :--- |
| `eureka-server` | Đăng ký và phát hiện dịch vụ (Service Discovery) | ✅ Hoàn thành |
| `api-gateway` | Định tuyến yêu cầu, quản lý tập trung API | ✅ Hoàn thành |
| `user-service` | Quản lý người dùng và xác thực | ⏳ Đang phát triển |
| `product-service`| Quản lý sản phẩm | 📅 Kế hoạch |
| `order-service`  | Quản lý đơn hàng | 📅 Kế hoạch |

---

## ⚙️ Hướng dẫn cài đặt & Khởi chạy nhanh

### 📋 Yêu cầu hệ thống
* **Java 17** hoặc mới hơn.
* **Maven 3.8+**
* **Docker & Docker Compose** đã được cài đặt và khởi động.

### 🏃 Khởi chạy các dịch vụ nền với Docker
Để chạy các container bổ trợ cần thiết (như Cơ sở dữ liệu, Message Broker nếu có), di chuyển vào thư mục gốc chứa file `docker-compose.yml` và chạy lệnh:
```bash
docker-compose up -d
