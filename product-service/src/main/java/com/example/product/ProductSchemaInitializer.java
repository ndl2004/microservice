package com.example.product;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class ProductSchemaInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(ProductSchemaInitializer.class);

    private final JdbcTemplate jdbcTemplate;

    public ProductSchemaInitializer(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) {
        jdbcTemplate.execute("ALTER TABLE product MODIFY COLUMN main_image LONGTEXT");
        log.info("Product main_image column verified as LONGTEXT");
    }
}
