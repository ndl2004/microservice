package com.example.order;

import com.example.order.client.ProductClient;
import com.example.order.client.UserClient;
import com.example.order.config.RabbitConfig;
import com.example.order.dto.*;
import com.example.order.event.OrderEventLog;
import com.example.order.event.OrderEventLogService;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/orders")
public class OrderController {

    private static final Logger log = LoggerFactory.getLogger(OrderController.class);

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductClient productClient;
    private final UserClient userClient;
    private final RabbitTemplate rabbitTemplate;
    private final OrderEventLogService orderEventLogService;

    public OrderController(
            OrderRepository orderRepository,
            OrderItemRepository orderItemRepository,
            ProductClient productClient,
            UserClient userClient,
            RabbitTemplate rabbitTemplate,
            OrderEventLogService orderEventLogService
    ) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.productClient = productClient;
        this.userClient = userClient;
        this.rabbitTemplate = rabbitTemplate;
        this.orderEventLogService = orderEventLogService;
    }

    @GetMapping
    public List<Order> getAllOrders() {
        return attachItems(orderRepository.findAll());
    }

    @GetMapping("/user/{userId}")
    public List<Order> getOrdersByUserId(@PathVariable Long userId) {
        return attachItems(orderRepository.findByUserId(userId));
    }

    @GetMapping("/events")
    public List<OrderEventLog> getOrderEvents() {
        return orderEventLogService.findAll();
    }

    @GetMapping("/{id}/events")
    public List<OrderEventLog> getOrderEventsByOrderId(@PathVariable Long id) {
        return orderEventLogService.findByOrderId(id);
    }

    @PostMapping
    public Map<String, Object> createOrder(@RequestBody OrderRequest request) {
        log.info("Creating order for userId={} with {} item(s)",
                request.getUserId(),
                request.getItems() == null ? 0 : request.getItems().size());

        UserDTO user = userClient.getUserById(request.getUserId());

        List<Map<String, Object>> products = new ArrayList<>();
        double total = 0;

        for (OrderItemRequest item : request.getItems()) {

            ProductDTO product = productClient.getProductById(item.getProductId());

            double itemTotal = product.getPrice() * item.getQuantity();
            total += itemTotal;

            Map<String, Object> productInfo = new HashMap<>();
            productInfo.put("productId", product.getId());
            productInfo.put("productName", product.getName());
            productInfo.put("price", product.getPrice());
            productInfo.put("quantity", item.getQuantity());
            productInfo.put("itemTotal", itemTotal);

            products.add(productInfo);
        }

        Order order = new Order(
                request.getUserId(),
                total,
                "PENDING",
                request.getFullName(),
                request.getPhone(),
                request.getAddress(),
                request.getNote(),
                request.getPaymentMethod() == null ? "cod" : request.getPaymentMethod(),
                "UNPAID"
        );

        orderRepository.save(order);

        List<OrderItem> orderItems = new ArrayList<>();
        for (Map<String, Object> productInfo : products) {
            OrderItem orderItem = new OrderItem(
                    order.getId(),
                    (Long) productInfo.get("productId"),
                    (String) productInfo.get("productName"),
                    (Double) productInfo.get("price"),
                    (Integer) productInfo.get("quantity"),
                    (Double) productInfo.get("itemTotal")
            );
            orderItems.add(orderItemRepository.save(orderItem));
        }
        order.setItems(orderItems);

        Map<String, Object> eventPayload = new HashMap<>();
        eventPayload.put("totalAmount", total);
        eventPayload.put("status", order.getStatus());
        eventPayload.put("fullName", order.getFullName());
        eventPayload.put("phone", order.getPhone());
        eventPayload.put("address", order.getAddress());
        eventPayload.put("paymentMethod", order.getPaymentMethod());
        eventPayload.put("products", products);
        eventPayload.put("itemCount", request.getItems().size());

        orderEventLogService.save(
                order.getId(),
                order.getUserId(),
                "ORDER_CREATED",
                "Order created and waiting for stock confirmation.",
                eventPayload
        );

        StockRequest stockRequest = new StockRequest(
                order.getId(),
                request.getItems()
        );

        // Kiểm tra converter đang được sử dụng
        log.info("RabbitMQ message converter={}",
                rabbitTemplate.getMessageConverter().getClass().getName());

        rabbitTemplate.convertAndSend(
                RabbitConfig.STOCK_REQUEST_QUEUE,
                stockRequest
        );
        log.info("Sent stock request for orderId={} to queue={}",
                order.getId(),
                RabbitConfig.STOCK_REQUEST_QUEUE);

        Map<String, Object> response = new HashMap<>();
        response.put(
                "message",
                "Order created. Waiting for stock confirmation."
        );
        response.put("orderId", order.getId());
        response.put("user", user);
        response.put("products", products);
        response.put("items", orderItems);
        response.put("totalAmount", total);
        response.put("status", order.getStatus());
        response.put("paymentMethod", order.getPaymentMethod());
        response.put("paymentStatus", order.getPaymentStatus());

        return response;
    }

    @GetMapping("/{id}")
    public Order getOrderById(@PathVariable Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Order not found"));
        order.setItems(orderItemRepository.findByOrderId(order.getId()));
        return order;
    }

    @PutMapping("/{id}/cancel")
    public Order cancelOrder(@PathVariable Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Order not found"));
        order.setStatus("CANCELLED");
        Order savedOrder = orderRepository.save(order);
        savedOrder.setItems(orderItemRepository.findByOrderId(savedOrder.getId()));
        orderEventLogService.save(
                savedOrder.getId(),
                savedOrder.getUserId(),
                "ORDER_CANCELLED",
                "Order was cancelled.",
                Map.of("status", savedOrder.getStatus())
        );
        log.info("Cancelled order id={}", savedOrder.getId());
        return savedOrder;
    }

    private List<Order> attachItems(List<Order> orders) {
        for (Order order : orders) {
            order.setItems(orderItemRepository.findByOrderId(order.getId()));
        }
        return orders;
    }
}
