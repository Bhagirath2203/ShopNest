package com.shopnest.backend.service;

import com.shopnest.backend.dto.cart.CartItemRequest;
import com.shopnest.backend.dto.cart.CartResponse;
import com.shopnest.backend.entity.Cart;
import com.shopnest.backend.entity.CartItem;
import com.shopnest.backend.entity.Product;
import com.shopnest.backend.entity.User;
import com.shopnest.backend.exception.InsufficientStockException;
import com.shopnest.backend.repository.CartItemRepository;
import com.shopnest.backend.repository.CartRepository;
import com.shopnest.backend.repository.ProductRepository;
import com.shopnest.backend.security.CustomUserDetails;
import com.shopnest.backend.service.impl.CartServiceImpl;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CartServiceTest {

    @Mock private CartRepository cartRepository;
    @Mock private CartItemRepository cartItemRepository;
    @Mock private ProductRepository productRepository;

    @InjectMocks
    private CartServiceImpl cartService;

    private User testUser;
    private Cart testCart;
    private Product testProduct;

    @BeforeEach
    void setUp() {
        // Set up a mock SecurityContext so SecurityUtils.getCurrentUserId() works
        testUser = User.builder().id(1L).name("Test User").email("test@example.com").password("encoded").build();
        CustomUserDetails userDetails = new CustomUserDetails(testUser);
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                userDetails, null, userDetails.getAuthorities()
        );
        SecurityContext securityContext = SecurityContextHolder.createEmptyContext();
        securityContext.setAuthentication(auth);
        SecurityContextHolder.setContext(securityContext);

        // Set up test cart and product
        testCart = Cart.builder().id(1L).user(testUser).items(new ArrayList<>()).build();
        testProduct = Product.builder()
                .id(10L)
                .name("Test Headphones")
                .price(BigDecimal.valueOf(1999))
                .stock(50)
                .active(true)
                .build();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("addToCart() — new product: creates new CartItem")
    void addToCart_newProduct_createsCartItem() {
        // Arrange
        CartItemRequest request = CartItemRequest.builder()
                .productId(10L).quantity(2).build();

        when(productRepository.findById(10L)).thenReturn(Optional.of(testProduct));
        when(cartRepository.findByUserId(1L)).thenReturn(Optional.of(testCart));
        when(cartItemRepository.findByCartIdAndProductId(1L, 10L)).thenReturn(Optional.empty());
        when(cartRepository.save(any(Cart.class))).thenReturn(testCart);

        // Act
        CartResponse response = cartService.addToCart(request);

        // Assert
        assertNotNull(response);
        verify(cartRepository, times(1)).save(any(Cart.class));
        // Cart should have one item added
        assertEquals(1, testCart.getItems().size());
        assertEquals(2, testCart.getItems().get(0).getQuantity());
    }

    @Test
    @DisplayName("addToCart() — existing product: increments quantity")
    void addToCart_existingProduct_incrementsQuantity() {
        // Arrange
        CartItem existingItem = CartItem.builder()
                .id(100L).cart(testCart).product(testProduct).quantity(3).build();

        CartItemRequest request = CartItemRequest.builder()
                .productId(10L).quantity(2).build();

        when(productRepository.findById(10L)).thenReturn(Optional.of(testProduct));
        when(cartRepository.findByUserId(1L)).thenReturn(Optional.of(testCart));
        when(cartItemRepository.findByCartIdAndProductId(1L, 10L)).thenReturn(Optional.of(existingItem));
        when(cartRepository.save(any(Cart.class))).thenReturn(testCart);

        // Act
        cartService.addToCart(request);

        // Assert — quantity should be 3 + 2 = 5
        assertEquals(5, existingItem.getQuantity());
        verify(cartRepository, times(1)).save(any(Cart.class));
    }

    @Test
    @DisplayName("addToCart() — insufficient stock: throws InsufficientStockException")
    void addToCart_insufficientStock_throwsException() {
        // Arrange — product has 50 stock, request 100
        CartItemRequest request = CartItemRequest.builder()
                .productId(10L).quantity(100).build();

        when(productRepository.findById(10L)).thenReturn(Optional.of(testProduct));

        // Act & Assert
        InsufficientStockException exception = assertThrows(
                InsufficientStockException.class,
                () -> cartService.addToCart(request)
        );

        assertTrue(exception.getMessage().contains("Test Headphones"));

        // Verify cart was never touched
        verify(cartRepository, never()).save(any(Cart.class));
    }
}
