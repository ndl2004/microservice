package com.example.inventory;

import com.example.inventory.dto.OrderItemRequest;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/inventory")
public class InventoryController {

    private final InventoryRepository inventoryRepository;

    public InventoryController(InventoryRepository inventoryRepository) {
        this.inventoryRepository = inventoryRepository;
    }

    @GetMapping
    public List<Inventory> getAllInventory() {
        return inventoryRepository.findAll();
    }

    @GetMapping("/{productId}")
    public Inventory getInventoryByProductId(@PathVariable Long productId) {
        return inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new RuntimeException("Inventory not found"));
    }

    @PutMapping("/{productId}")
    public Inventory upsertInventory(@PathVariable Long productId,
                                     @RequestBody Inventory request) {

        Inventory inventory = inventoryRepository.findByProductId(productId)
                .orElseGet(Inventory::new);

        inventory.setProductId(productId);
        inventory.setQuantity(request.getQuantity() == null ? 0 : request.getQuantity());

        return inventoryRepository.save(inventory);
    }

    @PostMapping("/decrease")
    public Inventory decreaseStock(@RequestBody OrderItemRequest request) {

        Inventory inventory = inventoryRepository.findByProductId(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Inventory not found"));

        if (inventory.getQuantity() < request.getQuantity()) {
            throw new RuntimeException("Not enough stock");
        }

        inventory.setQuantity(inventory.getQuantity() - request.getQuantity());

        return inventoryRepository.save(inventory);
    }
}
