package com.shopnest.backend.config;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;

/**
 * Loads environment variables from .env file BEFORE Spring context starts.
 * This ensures @Value annotations can resolve .env variables correctly.
 * 
 * Spring Boot's spring.config.import doesn't parse .env format (KEY=VALUE),
 * so this EnvironmentPostProcessor reads the file and adds the properties
 * to the Spring Environment before any beans are created.
 * 
 * Registered via META-INF/spring.factories.
 */
public class DotenvEnvironmentPostProcessor implements EnvironmentPostProcessor {

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        Path[] candidates = {
                Paths.get("..", ".env"),       // backend/ -> project root
                Paths.get(".env"),             // if running from project root
        };

        for (Path candidate : candidates) {
            Path envFile = candidate.toAbsolutePath().normalize();
            if (Files.exists(envFile)) {
                try {
                    Map<String, Object> envProps = new HashMap<>();

                    Files.readAllLines(envFile).stream()
                            .map(String::trim)
                            .filter(line -> !line.isEmpty() && !line.startsWith("#"))
                            .filter(line -> line.contains("="))
                            .forEach(line -> {
                                int idx = line.indexOf('=');
                                String key = line.substring(0, idx).trim();
                                String value = line.substring(idx + 1).trim();
                                envProps.put(key, value);
                            });

                    // Add with LOWEST priority so system env vars and
                    // application.properties can still override
                    environment.getPropertySources()
                            .addLast(new MapPropertySource("dotenv", envProps));

                } catch (IOException ignored) {
                    // Silently skip if unreadable
                }
                return;
            }
        }
    }
}
