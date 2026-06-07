package com.example.order;

import com.example.order.client.ProductClient;
import com.example.order.client.UserClient;
import com.example.order.dto.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import com.example.order.config.RabbitConfig;
import java.util.*;

@RestController
@RequestMapping("/orders")
public class OrderController {

    private final OrderRepository orderRepository;
    private final ProductClient productClient;
    private final UserClient userClient;
    private final RabbitTemplate rabbitTemplate;

    public OrderController(
            OrderRepository orderRepository,
            ProductClient productClient,
            UserClient userClient,
            RabbitTemplate rabbitTemplate
    ) {
        this.orderRepository = orderRepository;
        this.productClient = productClient;
        this.userClient = userClient;
        this.rabbitTemplate = rabbitTemplate;
    }

    @PostMapping
    public Map<String, Object> createOrder(@RequestBody OrderRequest request) {

        UserDTO user = userClient.getUserById(request.getUserId());

        List<Map<String, Object>> products = new ArrayList<>();
        double total = 0;

        for (OrderItemRequest item : request.getItems()) {

            ProductDTO product = productClient.getProductById(item.getProductId());

            double itemTotal = product.getPrice() * item.getQuantity();
            total += itemTotal;

            Map<String, Object> productInfo = new HashMap<>();
            productInfo.put("productName", product.getName());
            productInfo.put("price", product.getPrice());
            productInfo.put("quantity", item.getQuantity());
            productInfo.put("itemTotal", itemTotal);

            products.add(productInfo);
        }

        Order order = new Order(request.getUserId(), total);
        orderRepository.save(order);

        rabbitTemplate.convertAndSend(
                RabbitConfig.ORDER_QUEUE,
                "Đon hang moi đa đuoc tao. Order ID: " + order.getId()
        );

        Map<String, Object> response = new HashMap<>();
        response.put("orderId", order.getId());
        response.put("user", user);
        response.put("products", products);
        response.put("totalAmount", total);

        return response;
    }
}