package com.example.order.dto;

public class ProductDTO {
    private Long id;
    private String name;
    private Double price;

    public ProductDTO() {}

    public Long getId() { return id; }
    public String getName() { return name; }
    public Double getPrice() { return price; }

    public void setId(Long id) { this.id = id; }
    public void setName(String name) { this.name = name; }
    public void setPrice(Double price) { this.price = price; }
}
