package com.example.product;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class ProductDataInitializer implements CommandLineRunner {

    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;

    public ProductDataInitializer(CategoryRepository categoryRepository,
                                  BrandRepository brandRepository) {
        this.categoryRepository = categoryRepository;
        this.brandRepository = brandRepository;
    }

    @Override
    public void run(String... args) {
        if (categoryRepository.count() == 0) {
            createCategory("Chăm sóc da", "cham-soc-da", "Sữa rửa mặt, toner, serum, kem dưỡng và chống nắng.");
            createCategory("Trang điểm", "trang-diem", "Son môi, kem nền, phấn phủ, mascara và bảng mắt.");
            createCategory("Nước hoa", "nuoc-hoa", "Nước hoa nữ, body mist và sản phẩm tạo hương.");
            createCategory("Chăm sóc tóc", "cham-soc-toc", "Dầu gội, dầu xả, ủ tóc và serum dưỡng tóc.");
            createCategory("Chăm sóc cơ thể", "cham-soc-co-the", "Sữa tắm, dưỡng thể, tẩy tế bào chết và chăm sóc tay chân.");
        }

        if (brandRepository.count() == 0) {
            createBrand("LunaCos", "lunacos", "Thương hiệu mỹ phẩm demo cho đồ án microservices.", "");
            createBrand("La Roche-Posay", "la-roche-posay", "Dược mỹ phẩm chăm sóc da.", "");
            createBrand("Innisfree", "innisfree", "Mỹ phẩm thiên nhiên Hàn Quốc.", "");
            createBrand("Maybelline", "maybelline", "Thương hiệu trang điểm phổ biến.", "");
            createBrand("The Face Shop", "the-face-shop", "Mỹ phẩm và chăm sóc da Hàn Quốc.", "");
            createBrand("MAC", "mac", "Thương hiệu trang điểm chuyên nghiệp.", "");
        }
    }

    private void createCategory(String name, String slug, String description) {
        Category category = new Category();
        category.setName(name);
        category.setSlug(slug);
        category.setDescription(description);
        category.setStatus("ACTIVE");
        categoryRepository.save(category);
    }

    private void createBrand(String name, String slug, String description, String logoUrl) {
        Brand brand = new Brand();
        brand.setName(name);
        brand.setSlug(slug);
        brand.setDescription(description);
        brand.setLogoUrl(logoUrl);
        brand.setStatus("ACTIVE");
        brandRepository.save(brand);
    }
}
