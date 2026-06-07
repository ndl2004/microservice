package com.example.order;

import com.example.order.config.RabbitConfig;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
public class OrderConsumer {

    @RabbitListener(queues = RabbitConfig.ORDER_QUEUE)
    public void receiveOrderMessage(String message) {
        System.out.println("RabbitMQ nhan message: " + message);
    }
}