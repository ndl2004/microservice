package com.example.product;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/brands")
public class BrandController {

    private final BrandRepository repository;

    public BrandController(BrandRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<Brand> getAll() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public Brand getById(@PathVariable Long id) {
        return repository.findById(id).orElse(null);
    }

    @PostMapping
    @CacheEvict(value = "products", allEntries = true)
    public Brand create(@RequestBody Brand brand) {
        return repository.save(brand);
    }

    @PutMapping("/{id}")
    @CacheEvict(value = "products", allEntries = true)
    public Brand update(@PathVariable Long id, @RequestBody Brand request) {
        Brand brand = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Brand not found"));

        brand.setName(request.getName());
        brand.setSlug(request.getSlug());
        brand.setDescription(request.getDescription());
        brand.setLogoUrl(request.getLogoUrl());
        brand.setStatus(request.getStatus() == null ? "ACTIVE" : request.getStatus());

        return repository.save(brand);
    }
}
