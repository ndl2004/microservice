package com.example.order.dto;

import java.io.Serializable;

public class StockResultEvent implements Serializable {

    private Long orderId;
    private boolean success;
    private String message;

    public StockResultEvent() {
    }

    public StockResultEvent(Long orderId,
                            boolean success,
                            String message) {
        this.orderId = orderId;
        this.success = success;
        this.message = message;
    }

    public Long getOrderId() {
        return orderId;
    }

    public boolean isSuccess() {
        return success;
    }

    public String getMessage() {
        return message;
    }

    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}