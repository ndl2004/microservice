package com.example.order;

import com.example.order.config.RabbitConfig;
import com.example.order.dto.StockResultEvent;
import com.example.order.event.OrderEventLogService;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
public class OrderConsumer {

    private static final Logger log = LoggerFactory.getLogger(OrderConsumer.class);

    private final OrderRepository orderRepository;
    private final OrderEventLogService orderEventLogService;

    public OrderConsumer(OrderRepository orderRepository,
                         OrderEventLogService orderEventLogService) {
        this.orderRepository = orderRepository;
        this.orderEventLogService = orderEventLogService;
    }

    @RabbitListener(queues = RabbitConfig.STOCK_RESULT_QUEUE)
    public void handleStockResult(StockResultEvent event) {

        Order order = orderRepository.findById(event.getOrderId())
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (event.isSuccess()) {
            order.setStatus("CONFIRMED");
        } else {
            order.setStatus("CANCELLED");
        }

        orderRepository.save(order);

        Map<String, Object> payload = new HashMap<>();
        payload.put("success", event.isSuccess());
        payload.put("stockMessage", event.getMessage());
        payload.put("status", order.getStatus());

        orderEventLogService.save(
                order.getId(),
                order.getUserId(),
                event.isSuccess() ? "STOCK_CONFIRMED" : "STOCK_REJECTED",
                event.getMessage(),
                payload
        );

        log.info("Saga result received for orderId={}, status={}, success={}",
                event.getOrderId(),
                order.getStatus(),
                event.isSuccess());
    }
}
