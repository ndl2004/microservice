package com.example.product;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/products")
public class ProductController {

    private final ProductRepository repository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;

    public ProductController(ProductRepository repository,
                             CategoryRepository categoryRepository,
                             BrandRepository brandRepository) {
        this.repository = repository;
        this.categoryRepository = categoryRepository;
        this.brandRepository = brandRepository;
    }

    @Cacheable("products")
    @GetMapping
    public List<Product> getAll() {
        System.out.println("Dang doc du lieu tu MySQL...");
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public Product getById(@PathVariable Long id) {
        return repository.findById(id).orElse(null);
    }

    @CacheEvict(value = "products", allEntries = true)
    @PostMapping
    public Product create(@RequestBody Product product) {
        enrichProduct(product);
        return repository.save(product);
    }

    @CacheEvict(value = "products", allEntries = true)
    @PutMapping("/{id}")
    public Product update(@PathVariable Long id, @RequestBody Product request) {
        Product product = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        product.setName(request.getName());
        product.setPrice(request.getPrice());
        product.setDescription(request.getDescription());
        product.setMainImage(request.getMainImage());
        product.setCategoryId(request.getCategoryId());
        product.setBrandId(request.getBrandId());
        product.setStatus(request.getStatus() == null ? "ACTIVE" : request.getStatus());

        enrichProduct(product);
        return repository.save(product);
    }

    private void enrichProduct(Product product) {
        if (product.getCategoryId() != null) {
            categoryRepository.findById(product.getCategoryId())
                    .ifPresent(category -> product.setCategoryName(category.getName()));
        }

        if (product.getBrandId() != null) {
            brandRepository.findById(product.getBrandId())
                    .ifPresent(brand -> product.setBrandName(brand.getName()));
        }
    }
}
