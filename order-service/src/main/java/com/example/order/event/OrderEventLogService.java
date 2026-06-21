package com.example.order.event;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class OrderEventLogService {

    private final OrderEventLogRepository repository;

    public OrderEventLogService(OrderEventLogRepository repository) {
        this.repository = repository;
    }

    public OrderEventLog save(Long orderId,
                              Long userId,
                              String eventType,
                              String message,
                              Map<String, Object> payload) {
        OrderEventLog log = new OrderEventLog(
                orderId,
                userId,
                eventType,
                message,
                LocalDateTime.now(),
                payload
        );

        return repository.save(log);
    }

    public List<OrderEventLog> findAll() {
        return repository.findAll();
    }

    public List<OrderEventLog> findByOrderId(Long orderId) {
        return repository.findByOrderIdOrderByCreatedAtDesc(orderId);
    }
}
