package com.shopnest.backend.service.impl;

import com.shopnest.backend.service.AIService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class AIServiceImpl implements AIService {

    @Value("${app.gemini.api-key:}")
    private String apiKey;

    private final RestTemplate restTemplate;

    public AIServiceImpl() {
        this.restTemplate = new RestTemplate();
    }

    @Override
    public String generateDescription(String productName) {
        if (apiKey == null || apiKey.isBlank()) {
            log.warn("Gemini API key not configured — returning fallback description");
            return "A premium quality " + productName + " designed for the modern consumer. "
                    + "Experience superior craftsmanship and unmatched performance.";
        }

        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + apiKey;

        String prompt = "Write a compelling 2-3 sentence e-commerce product description for: '"
                + productName + "'. Focus on benefits, make it engaging for buyers. "
                + "Do NOT include any markdown formatting, just plain text.";

        try {
            // Build Gemini API request body
            Map<String, Object> requestBody = Map.of(
                    "contents", List.of(
                            Map.of("parts", List.of(
                                    Map.of("text", prompt)
                            ))
                    )
            );

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, entity, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                // Parse: response.candidates[0].content.parts[0].text
                Map body = response.getBody();
                List<Map> candidates = (List<Map>) body.get("candidates");
                if (candidates != null && !candidates.isEmpty()) {
                    Map content = (Map) candidates.get(0).get("content");
                    List<Map> parts = (List<Map>) content.get("parts");
                    if (parts != null && !parts.isEmpty()) {
                        String text = (String) parts.get(0).get("text");
                        log.info("AI description generated for product: '{}'", productName);
                        return text.trim();
                    }
                }
            }

            log.warn("Unexpected Gemini API response structure for product: '{}'", productName);
            return "A premium quality " + productName + " — explore its features and benefits.";

        } catch (Exception e) {
            log.error("Gemini API call failed for product '{}': {}", productName, e.getMessage());
            return "A premium quality " + productName + " designed for the modern consumer. "
                    + "Experience superior craftsmanship and unmatched performance.";
        }
    }
}
