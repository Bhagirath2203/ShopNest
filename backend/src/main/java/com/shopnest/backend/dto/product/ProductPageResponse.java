package com.shopnest.backend.dto.product;

import com.shopnest.backend.entity.Product;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Page;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductPageResponse {

    private List<ProductResponse> content;
    private int currentPage;
    private int totalPages;
    private long totalElements;
    private int pageSize;
    private boolean last;

    public static ProductPageResponse fromPage(Page<Product> page) {
        return ProductPageResponse.builder()
                .content(page.getContent().stream()
                        .map(ProductResponse::fromEntity)
                        .toList())
                .currentPage(page.getNumber())
                .totalPages(page.getTotalPages())
                .totalElements(page.getTotalElements())
                .pageSize(page.getSize())
                .last(page.isLast())
                .build();
    }
}
