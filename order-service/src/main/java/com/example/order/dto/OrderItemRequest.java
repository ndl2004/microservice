package com.example.order.dto;

import java.io.Serializable;

public class OrderItemRequest implements Serializable {

    private Long productId;
    private Integer quantity;

    public OrderItemRequest() {
    }

    public Long getProductId() {
        return productId;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
}