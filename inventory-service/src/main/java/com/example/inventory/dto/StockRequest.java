package com.example.inventory.dto;

import java.io.Serializable;
import java.util.List;

public class StockRequest implements Serializable {

    private Long orderId;
    private List<OrderItemRequest> items;

    public StockRequest() {
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