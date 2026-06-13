package com.shopnest.backend.service;

import com.shopnest.backend.dto.order.OrderRequest;
import com.shopnest.backend.dto.order.OrderResponse;
import com.shopnest.backend.entity.*;
import com.shopnest.backend.repository.AddressRepository;
import com.shopnest.backend.repository.CartRepository;
import com.shopnest.backend.repository.OrderRepository;
import com.shopnest.backend.repository.ProductRepository;
import com.shopnest.backend.security.CustomUserDetails;
import com.shopnest.backend.service.impl.OrderServiceImpl;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock private OrderRepository orderRepository;
    @Mock private CartRepository cartRepository;
    @Mock private AddressRepository addressRepository;
    @Mock private ProductRepository productRepository;

    @InjectMocks
    private OrderServiceImpl orderService;

    private User testUser;
    private Cart testCart;
    private Address testAddress;
    private Product testProduct;

    @BeforeEach
    void setUp() {
        // Set up SecurityContext for SecurityUtils.getCurrentUser()
        testUser = User.builder()
                .id(1L).name("Test User").email("test@example.com").password("encoded").build();
        CustomUserDetails userDetails = new CustomUserDetails(testUser);
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                userDetails, null, userDetails.getAuthorities()
        );
        SecurityContext securityContext = SecurityContextHolder.createEmptyContext();
        securityContext.setAuthentication(auth);
        SecurityContextHolder.setContext(securityContext);

        // Set up test entities
        testProduct = Product.builder()
                .id(10L).name("Wireless Headphones")
                .price(BigDecimal.valueOf(1999)).stock(50).active(true).build();

        testAddress = Address.builder()
                .id(5L).user(testUser).street("123 Main St").city("Mumbai")
                .state("Maharashtra").pincode("400001").country("India").build();

        testCart = Cart.builder().id(1L).user(testUser).items(new ArrayList<>()).build();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("placeOrder() — success: reduces stock, clears cart, creates order")
    void placeOrder_success_reducesStockAndClearsCart() {
        // Arrange — cart with 2 units of testProduct
        CartItem cartItem = CartItem.builder()
                .id(100L).cart(testCart).product(testProduct).quantity(2).build();
        testCart.getItems().add(cartItem);

        OrderRequest request = OrderRequest.builder().addressId(5L).build();

        when(cartRepository.findByUserId(1L)).thenReturn(Optional.of(testCart));
        when(addressRepository.findById(5L)).thenReturn(Optional.of(testAddress));
        when(productRepository.save(any(Product.class))).thenAnswer(inv -> inv.getArgument(0));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> {
            Order order = inv.getArgument(0);
            order.setId(1L);
            return order;
        });
        when(cartRepository.save(any(Cart.class))).thenReturn(testCart);

        // Act
        OrderResponse response = orderService.placeOrder(request);

        // Assert
        assertNotNull(response);

        // Stock should be reduced: 50 - 2 = 48
        assertEquals(48, testProduct.getStock());

        // Cart should be cleared
        assertTrue(testCart.getItems().isEmpty());

        // Verify order was saved
        verify(orderRepository, times(1)).save(any(Order.class));
        // Verify product stock was saved
        verify(productRepository, times(1)).save(testProduct);
    }

    @Test
    @DisplayName("placeOrder() — empty cart: throws IllegalStateException")
    void placeOrder_emptyCart_throwsException() {
        // Arrange — cart with no items
        OrderRequest request = OrderRequest.builder().addressId(5L).build();

        when(cartRepository.findByUserId(1L)).thenReturn(Optional.of(testCart));
        // testCart.items is empty by default

        // Act & Assert
        IllegalStateException exception = assertThrows(
                IllegalStateException.class,
                () -> orderService.placeOrder(request)
        );

        assertTrue(exception.getMessage().contains("empty cart"));

        // Verify no order was created
        verify(orderRepository, never()).save(any(Order.class));
    }
}
