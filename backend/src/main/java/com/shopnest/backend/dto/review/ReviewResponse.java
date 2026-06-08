package com.shopnest.backend.dto.review;

import com.shopnest.backend.entity.Review;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewResponse {

    private Long id;
    private Integer rating;
    private String title;
    private String body;
    private String userName;
    private Long userId;
    private LocalDateTime createdAt;

    public static ReviewResponse fromEntity(Review r) {
        String fullName = r.getUser().getName();
        // Show first name only for privacy (e.g., "Bhagirath S.")
        String displayName = fullName;
        if (fullName != null && fullName.contains(" ")) {
            displayName = fullName.split(" ")[0];
        }

        return ReviewResponse.builder()
                .id(r.getId())
                .rating(r.getRating())
                .title(r.getTitle())
                .body(r.getBody())
                .userName(displayName)
                .userId(r.getUser().getId())
                .createdAt(r.getCreatedAt())
                .build();
    }
}
