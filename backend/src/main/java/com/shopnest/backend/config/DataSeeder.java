package com.shopnest.backend.config;

import com.shopnest.backend.entity.*;
import com.shopnest.backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;

/**
 * Seeds the database with essential reference data on application startup.
 * - Roles: ROLE_USER, ROLE_ADMIN
 * - Admin user: admin@shopnest.com / admin123
 * - Test user: user@shopnest.com / user123 (with empty cart)
 * - 8 categories and 30 products across all categories
 *
 * All seeding is idempotent — only runs if tables are empty.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements ApplicationRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final CartRepository cartRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        seedRoles();
        seedUsers();
        seedCategoriesAndProducts();
    }

    // ─────────────── ROLES ───────────────

    private void seedRoles() {
        seedRole("ROLE_USER");
        seedRole("ROLE_ADMIN");
    }

    private void seedRole(String roleName) {
        if (roleRepository.findByName(roleName).isEmpty()) {
            roleRepository.save(Role.builder().name(roleName).build());
            log.info("Seeded role: {}", roleName);
        }
    }

    // ─────────────── USERS ───────────────

    private void seedUsers() {
        // Admin user
        if (!userRepository.existsByEmail("admin@shopnest.com")) {
            Role adminRole = roleRepository.findByName("ROLE_ADMIN")
                    .orElseThrow(() -> new RuntimeException("ROLE_ADMIN not found"));
            Role userRole = roleRepository.findByName("ROLE_USER")
                    .orElseThrow(() -> new RuntimeException("ROLE_USER not found"));

            User admin = User.builder()
                    .name("ShopNest Admin")
                    .email("admin@shopnest.com")
                    .password(passwordEncoder.encode("admin123"))
                    .roles(new HashSet<>(Set.of(adminRole, userRole)))
                    .build();
            userRepository.save(admin);

            // Create cart for admin
            cartRepository.save(Cart.builder().user(admin).build());
            log.info("Seeded admin user: admin@shopnest.com / admin123");
        }

        // Test user
        if (!userRepository.existsByEmail("user@shopnest.com")) {
            Role userRole = roleRepository.findByName("ROLE_USER")
                    .orElseThrow(() -> new RuntimeException("ROLE_USER not found"));

            User testUser = User.builder()
                    .name("Test User")
                    .email("user@shopnest.com")
                    .password(passwordEncoder.encode("user123"))
                    .roles(new HashSet<>(Set.of(userRole)))
                    .build();
            userRepository.save(testUser);

            // Create cart for test user
            cartRepository.save(Cart.builder().user(testUser).build());
            log.info("Seeded test user: user@shopnest.com / user123");
        }
    }

    // ─────────────── CATEGORIES & PRODUCTS ───────────────

    private void seedCategoriesAndProducts() {
        if (categoryRepository.count() > 0) {
            log.debug("Categories already exist — skipping seed");
            return;
        }

        Map<String, Category> categories = new LinkedHashMap<>();
        List<String> categoryNames = List.of(
                "Electronics", "Clothing", "Books", "Home & Kitchen",
                "Sports", "Beauty", "Toys", "Groceries"
        );

        for (String name : categoryNames) {
            Category cat = categoryRepository.save(
                    Category.builder()
                            .name(name)
                            .description("Browse our " + name.toLowerCase() + " collection")
                            .build()
            );
            categories.put(name, cat);
        }
        log.info("Seeded {} categories", categories.size());

        // ── Electronics (5 products) ──
        Category electronics = categories.get("Electronics");
        seedProduct("iPhone 15 Pro", "Experience the pinnacle of mobile innovation with the A17 Pro chip, 48MP camera system, and aerospace-grade titanium design. Capture stunning photos and enjoy all-day battery life.", new BigDecimal("129999.00"), 25, "https://picsum.photos/seed/iphone15/400/400", electronics);
        seedProduct("Samsung Galaxy S24 Ultra", "Unleash creativity with the built-in S Pen, 200MP camera, and AI-powered features. The titanium frame and vibrant AMOLED display deliver a premium experience.", new BigDecimal("109999.00"), 30, "https://picsum.photos/seed/galaxys24/400/400", electronics);
        seedProduct("Sony WH-1000XM5 Headphones", "Industry-leading noise cancellation meets exceptional sound quality. 30-hour battery life and ultra-comfortable design make these the perfect companion for music lovers.", new BigDecimal("24990.00"), 50, "https://picsum.photos/seed/sonywh1000/400/400", electronics);
        seedProduct("MacBook Air M3", "Supercharged by the M3 chip, this impossibly thin laptop delivers blazing performance, stunning Liquid Retina display, and up to 18 hours of battery life.", new BigDecimal("114900.00"), 15, "https://picsum.photos/seed/macbookair/400/400", electronics);
        seedProduct("iPad Air 2024", "Powerful M2 chip meets a stunning 11-inch Liquid Retina display. Perfect for creative work, entertainment, and everything in between with Apple Pencil support.", new BigDecimal("59900.00"), 35, "https://picsum.photos/seed/ipadair/400/400", electronics);

        // ── Clothing (4 products) ──
        Category clothing = categories.get("Clothing");
        seedProduct("Nike Air Max 270", "Experience ultimate all-day comfort with the largest Air unit yet for a super-soft, bouncy feel with every step. Sleek, breathable design for your active lifestyle.", new BigDecimal("12995.00"), 60, "https://picsum.photos/seed/nikeairmax/400/400", clothing);
        seedProduct("Levi's 501 Original Jeans", "The iconic straight fit that started it all. Made with premium denim that gets better with every wear, these jeans are a timeless wardrobe essential.", new BigDecimal("3999.00"), 80, "https://picsum.photos/seed/levis501/400/400", clothing);
        seedProduct("Adidas Ultraboost Running Shoes", "Responsive BOOST cushioning returns energy with every stride. Primeknit upper adapts to your foot for a locked-in, supportive fit during runs.", new BigDecimal("16999.00"), 45, "https://picsum.photos/seed/ultraboost/400/400", clothing);
        seedProduct("Ray-Ban Aviator Sunglasses", "The legendary pilot-shaped sunglasses with iconic teardrop lenses. Premium metal frame and crystal-clear optics provide 100% UV protection with timeless style.", new BigDecimal("7490.00"), 40, "https://picsum.photos/seed/rayban/400/400", clothing);

        // ── Books (4 products) ──
        Category books = categories.get("Books");
        seedProduct("The Alchemist — Paulo Coelho", "A magical tale of Santiago, an Andalusian shepherd boy who journeys to the Egyptian pyramids. A worldwide bestseller that inspires dreamers to follow their personal legend.", new BigDecimal("299.00"), 100, "https://picsum.photos/seed/alchemist/400/400", books);
        seedProduct("Atomic Habits — James Clear", "Transform your life with tiny changes that deliver remarkable results. The definitive guide to breaking bad habits and building good ones, backed by proven science.", new BigDecimal("499.00"), 90, "https://picsum.photos/seed/atomichabits/400/400", books);
        seedProduct("Clean Code — Robert C. Martin", "A must-read for every software developer. Learn to write clean, readable, and maintainable code with practical examples and timeless principles.", new BigDecimal("599.00"), 70, "https://picsum.photos/seed/cleancode/400/400", books);
        seedProduct("Sapiens — Yuval Noah Harari", "A groundbreaking narrative of humanity's creation and evolution. Explore how Homo sapiens conquered the world through cognitive, agricultural, and scientific revolutions.", new BigDecimal("449.00"), 85, "https://picsum.photos/seed/sapiens/400/400", books);

        // ── Home & Kitchen (4 products) ──
        Category home = categories.get("Home & Kitchen");
        seedProduct("Instant Pot Duo 7-in-1", "The ultimate kitchen companion: pressure cooker, slow cooker, rice cooker, steamer, sauté pan, yogurt maker, and warmer — all in one. Cooks meals 70% faster.", new BigDecimal("5999.00"), 40, "https://picsum.photos/seed/instantpot/400/400", home);
        seedProduct("Dyson V15 Vacuum Cleaner", "Laser reveals hidden dust while intelligent suction auto-adjusts power. HEPA filtration captures 99.99% of particles for a truly deep clean.", new BigDecimal("52990.00"), 20, "https://picsum.photos/seed/dysonv15/400/400", home);
        seedProduct("Philips Air Fryer XXL", "Cook crispy, delicious food with 90% less oil using Rapid Air technology. The extra-large capacity feeds the whole family with one batch.", new BigDecimal("12999.00"), 35, "https://picsum.photos/seed/airfryer/400/400", home);
        seedProduct("Borosil Stainless Steel Flask", "Premium vacuum-insulated flask keeps beverages hot for 24 hours or cold for 48 hours. Leak-proof, BPA-free, and built to last with surgical-grade steel.", new BigDecimal("899.00"), 100, "https://picsum.photos/seed/flask/400/400", home);

        // ── Sports (4 products) ──
        Category sports = categories.get("Sports");
        seedProduct("Yonex Badminton Racket Astrox 88D", "Designed for devastating attack play with Rotational Generator System. Enhanced sweet spot and improved shuttle hold for maximum power in every smash.", new BigDecimal("8999.00"), 30, "https://picsum.photos/seed/yonex/400/400", sports);
        seedProduct("Fitbit Charge 6 Fitness Tracker", "Advanced health tracking with built-in GPS, heart rate monitoring, and sleep analysis. Get real-time workout stats and 7-day battery life to keep you moving.", new BigDecimal("14999.00"), 55, "https://picsum.photos/seed/fitbit/400/400", sports);
        seedProduct("Nivia Storm Football Size 5", "Tournament-grade football with hand-stitched panels for superior flight consistency. Water-resistant PU cover maintains grip and durability in all conditions.", new BigDecimal("799.00"), 100, "https://picsum.photos/seed/football/400/400", sports);
        seedProduct("Boldfit Yoga Mat 6mm", "Extra-thick 6mm cushioning protects joints during yoga, pilates, and floor exercises. Anti-slip texture on both sides ensures stability in every pose.", new BigDecimal("599.00"), 80, "https://picsum.photos/seed/yogamat/400/400", sports);

        // ── Beauty (3 products) ──
        Category beauty = categories.get("Beauty");
        seedProduct("Maybelline Fit Me Foundation", "Lightweight, breathable formula matches your skin's natural tone and texture. Oil-free and non-comedogenic for a flawless, natural-looking finish all day long.", new BigDecimal("499.00"), 90, "https://picsum.photos/seed/maybelline/400/400", beauty);
        seedProduct("The Body Shop Tea Tree Face Wash", "Deep-cleansing gel formula infused with Community Trade tea tree oil from Kenya. Removes impurities and excess oil without over-drying skin.", new BigDecimal("695.00"), 75, "https://picsum.photos/seed/teatree/400/400", beauty);
        seedProduct("L'Oreal Paris Hyaluronic Acid Serum", "Intense hydration with 1.5% pure hyaluronic acid that plumps and smooths skin. Dermatologically tested formula absorbs instantly for a dewy, youthful glow.", new BigDecimal("599.00"), 60, "https://picsum.photos/seed/lorealserum/400/400", beauty);

        // ── Toys (3 products) ──
        Category toys = categories.get("Toys");
        seedProduct("LEGO Technic Lamborghini Sián", "Build the iconic Lamborghini Sián FKP 37 with this 3,696-piece masterpiece. Features working pistons, steering, and a sequential gearbox for the ultimate display model.", new BigDecimal("34999.00"), 10, "https://picsum.photos/seed/legolam/400/400", toys);
        seedProduct("Funskool Monopoly Classic Board Game", "The world's favorite family board game! Buy properties, build houses and hotels, collect rent, and bankrupt your opponents in this timeless strategy game.", new BigDecimal("599.00"), 50, "https://picsum.photos/seed/monopoly/400/400", toys);
        seedProduct("Hot Wheels 20 Car Gift Pack", "A thrilling set of 20 die-cast cars in 1:64 scale with cool designs and authentic details. Perfect for collectors and kids who love high-speed racing action.", new BigDecimal("1499.00"), 45, "https://picsum.photos/seed/hotwheels/400/400", toys);

        // ── Groceries (3 products) ──
        Category groceries = categories.get("Groceries");
        seedProduct("Tata Gold Premium Tea 500g", "Rich, aromatic tea made from the finest golden leaves of Assam. Delivers a strong, full-bodied cup with a naturally refreshing taste to start your morning right.", new BigDecimal("299.00"), 100, "https://picsum.photos/seed/tatagold/400/400", groceries);
        seedProduct("Saffola Gold Cooking Oil 5L", "Heart-healthy blended oil enriched with natural antioxidants. Dual-seed technology of rice bran and sunflower oil helps manage cholesterol effectively.", new BigDecimal("799.00"), 80, "https://picsum.photos/seed/saffola/400/400", groceries);
        seedProduct("Cadbury Dairy Milk Silk 150g", "Indulge in the silkiest, smoothest chocolate experience. Premium cocoa and rich milk combine to create an irresistibly creamy treat for every sweet moment.", new BigDecimal("199.00"), 100, "https://picsum.photos/seed/dairymilk/400/400", groceries);

        log.info("Seeded {} products across {} categories", productRepository.count(), categoryRepository.count());
    }

    private void seedProduct(String name, String description, BigDecimal price,
                             int stock, String imageUrl, Category category) {
        productRepository.save(Product.builder()
                .name(name)
                .description(description)
                .price(price)
                .stock(stock)
                .imageUrl(imageUrl)
                .category(category)
                .active(true)
                .build());
    }
}
