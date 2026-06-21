package com.example.order.event;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface OrderEventLogRepository extends MongoRepository<OrderEventLog, String> {
    List<OrderEventLog> findByOrderIdOrderByCreatedAtDesc(Long orderId);
}
