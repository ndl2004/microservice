package com.example.product;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/categories")
public class CategoryController {

    private final CategoryRepository repository;

    public CategoryController(CategoryRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<Category> getAll() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public Category getById(@PathVariable Long id) {
        return repository.findById(id).orElse(null);
    }

    @PostMapping
    @CacheEvict(value = "products", allEntries = true)
    public Category create(@RequestBody Category category) {
        return repository.save(category);
    }

    @PutMapping("/{id}")
    @CacheEvict(value = "products", allEntries = true)
    public Category update(@PathVariable Long id, @RequestBody Category request) {
        Category category = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        category.setName(request.getName());
        category.setSlug(request.getSlug());
        category.setDescription(request.getDescription());
        category.setStatus(request.getStatus() == null ? "ACTIVE" : request.getStatus());

        return repository.save(category);
    }
}
