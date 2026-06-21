package com.example.inventory;

import com.example.inventory.config.RabbitConfig;
import com.example.inventory.dto.OrderItemRequest;
import com.example.inventory.dto.StockRequest;
import com.example.inventory.dto.StockResultEvent;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

@Component
public class InventoryConsumer {

    private final InventoryRepository inventoryRepository;
    private final RabbitTemplate rabbitTemplate;

    public InventoryConsumer(
            InventoryRepository inventoryRepository,
            RabbitTemplate rabbitTemplate
    ) {
        this.inventoryRepository = inventoryRepository;
        this.rabbitTemplate = rabbitTemplate;
    }

    @RabbitListener(queues = RabbitConfig.STOCK_REQUEST_QUEUE)
    public void handleStockRequest(StockRequest request) {

        try {

            // Kiểm tra tồn kho trước
            for (OrderItemRequest item : request.getItems()) {

                Inventory inventory = inventoryRepository
                        .findByProductId(item.getProductId())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Product not found: "
                                                + item.getProductId()));

                if (inventory.getQuantity() < item.getQuantity()) {

                    rabbitTemplate.convertAndSend(
                            RabbitConfig.STOCK_RESULT_QUEUE,
                            new StockResultEvent(
                                    request.getOrderId(),
                                    false,
                                    "Not enough stock"
                            )
                    );

                    return;
                }
            }

            // Trừ kho
            for (OrderItemRequest item : request.getItems()) {

                Inventory inventory = inventoryRepository
                        .findByProductId(item.getProductId())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Product not found"));

                inventory.setQuantity(
                        inventory.getQuantity()
                                - item.getQuantity()
                );

                inventoryRepository.save(inventory);
            }

            rabbitTemplate.convertAndSend(
                    RabbitConfig.STOCK_RESULT_QUEUE,
                    new StockResultEvent(
                            request.getOrderId(),
                            true,
                            "Stock reserved successfully"
                    )
            );

        } catch (Exception e) {

            rabbitTemplate.convertAndSend(
                    RabbitConfig.STOCK_RESULT_QUEUE,
                    new StockResultEvent(
                            request.getOrderId(),
                            false,
                            e.getMessage()
                    )
            );
        }
    }
}