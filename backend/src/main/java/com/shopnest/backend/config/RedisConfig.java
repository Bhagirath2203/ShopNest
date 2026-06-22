package com.shopnest.backend.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.jsontype.BasicPolymorphicTypeValidator;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.cache.CacheManager;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;
import java.util.Map;

@Configuration
@Slf4j
public class RedisConfig {

    /**
     * Redis cache manager — used when Redis is available.
     * Uses a custom ObjectMapper with JavaTimeModule so LocalDateTime fields
     * in DTOs (e.g., ProductResponse.createdAt) can serialize/deserialize.
     */
    @Bean
    @Primary
    public CacheManager cacheManager(RedisConnectionFactory connectionFactory) {
        try {
            // Test connection first
            connectionFactory.getConnection().ping();

            ObjectMapper objectMapper = new ObjectMapper();
            objectMapper.registerModule(new JavaTimeModule());
            objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

            // Use EVERYTHING typing with a permissive validator
            BasicPolymorphicTypeValidator ptv = BasicPolymorphicTypeValidator.builder()
                    .allowIfBaseType(Object.class)
                    .build();
            objectMapper.activateDefaultTyping(ptv, ObjectMapper.DefaultTyping.EVERYTHING);

            GenericJackson2JsonRedisSerializer jsonSerializer =
                    new GenericJackson2JsonRedisSerializer(objectMapper);

            RedisCacheConfiguration defaultConfig = RedisCacheConfiguration.defaultCacheConfig()
                    .serializeKeysWith(
                            RedisSerializationContext.SerializationPair.fromSerializer(new StringRedisSerializer()))
                    .serializeValuesWith(
                            RedisSerializationContext.SerializationPair.fromSerializer(jsonSerializer))
                    .entryTtl(Duration.ofMinutes(10))
                    .disableCachingNullValues();

            Map<String, RedisCacheConfiguration> cacheConfigurations = Map.of(
                    "products", defaultConfig.entryTtl(Duration.ofMinutes(10)),
                    "categories", defaultConfig.entryTtl(Duration.ofMinutes(30))
            );

            log.info("✅ Redis cache manager initialized successfully");
            return RedisCacheManager.builder(connectionFactory)
                    .cacheDefaults(defaultConfig)
                    .withInitialCacheConfigurations(cacheConfigurations)
                    .build();

        } catch (Exception e) {
            log.warn("⚠️ Redis not available — falling back to in-memory cache: {}", e.getMessage());
            return new ConcurrentMapCacheManager("products", "categories");
        }
    }
}
