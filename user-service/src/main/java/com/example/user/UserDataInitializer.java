package com.example.user;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class UserDataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(UserDataInitializer.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserDataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        userRepository.findByEmail("admin@example.com").ifPresent(existingAdmin -> {
            existingAdmin.setRole("ADMIN");
            existingAdmin.setPassword(passwordEncoder.encode("123456"));
            userRepository.save(existingAdmin);
            log.info("Default admin account role verified: admin@example.com");
        });

        if (userRepository.existsByEmail("admin@example.com")) {
            return;
        }

        User admin = new User();
        admin.setFullName("Administrator");
        admin.setEmail("admin@example.com");
        admin.setPhone("0900000000");
        admin.setAddress("System");
        admin.setPassword(passwordEncoder.encode("123456"));
        admin.setRole("ADMIN");

        userRepository.save(admin);
        log.info("Default admin account created: admin@example.com");
    }
}
