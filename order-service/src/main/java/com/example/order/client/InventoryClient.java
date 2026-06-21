package com.example.order.client;

import com.example.order.dto.StockRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

@FeignClient(name = "inventory-service")
public interface InventoryClient {

    @PostMapping("/inventory/decrease")
    String decreaseStock(@RequestBody StockRequest request);
}