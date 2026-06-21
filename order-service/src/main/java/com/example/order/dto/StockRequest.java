package com.example.order.dto;

import java.io.Serializable;
import java.util.List;

public class StockRequest implements Serializable {

    private Long orderId;
    private List<OrderItemRequest> items;

    public StockRequest() {
    }

    public StockRequest(Long orderId, List<OrderItemRequest> items) {
        this.orderId = orderId;
        this.items = items;
    }

    public Long getOrderId() {
        return orderId;
    }

    public List<OrderItemRequest> getItems() {
        return items;
    }

    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }

    public void setItems(List<OrderItemRequest> items) {
        this.items = items;
    }
}