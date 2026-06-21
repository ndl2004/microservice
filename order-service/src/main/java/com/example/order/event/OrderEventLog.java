package com.example.order.event;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.Map;

@Document(collection = "order_event_logs")
public class OrderEventLog {

    @Id
    private String id;

    private Long orderId;
    private Long userId;
    private String eventType;
    private String message;
    private LocalDateTime createdAt;
    private Map<String, Object> payload;

    public OrderEventLog() {
    }

    public OrderEventLog(Long orderId,
                         Long userId,
                         String eventType,
                         String message,
                         LocalDateTime createdAt,
                         Map<String, Object> payload) {
        this.orderId = orderId;
        this.userId = userId;
        this.eventType = eventType;
        this.message = message;
        this.createdAt = createdAt;
        this.payload = payload;
    }

    public String getId() {
        return id;
    }

    public Long getOrderId() {
        return orderId;
    }

    public Long getUserId() {
        return userId;
    }

    public String getEventType() {
        return eventType;
    }

    public String getMessage() {
        return message;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public Map<String, Object> getPayload() {
        return payload;
    }

    public void setId(String id) {
        this.id = id;
    }

    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public void setEventType(String eventType) {
        this.eventType = eventType;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public void setPayload(Map<String, Object> payload) {
        this.payload = payload;
    }
}
