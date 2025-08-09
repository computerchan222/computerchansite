package com.yourapp.config;

import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;

@Configuration
@Profile("prod")
public class RailwayDatabaseConfig {
    
    @Bean
    @Primary
    public DataSourceProperties dataSourceProperties() {
        DataSourceProperties properties = new DataSourceProperties();
        
        // Get DATABASE_URL from environment
        String databaseUrl = System.getenv("DATABASE_URL");
        
        if (databaseUrl != null && !databaseUrl.isEmpty()) {
            // Convert postgresql:// to jdbc:postgresql://
            if (databaseUrl.startsWith("postgresql://")) {
                databaseUrl = "jdbc:" + databaseUrl;
            }
            properties.setUrl(databaseUrl);
        } else {
            // Fallback: build URL from individual components
            String host = System.getenv("PGHOST");
            String port = System.getenv("PGPORT");
            String database = System.getenv("PGDATABASE");
            
            if (host != null && port != null && database != null) {
                String jdbcUrl = String.format("jdbc:postgresql://%s:%s/%s", host, port, database);
                properties.setUrl(jdbcUrl);
            }
        }
        
        // Set username and password
        String username = System.getenv("PGUSER");
        String password = System.getenv("PGPASSWORD");
        
        if (username != null) {
            properties.setUsername(username);
        }
        if (password != null) {
            properties.setPassword(password);
        }
        
        properties.setDriverClassName("org.postgresql.Driver");
        
        // Log the connection details (without password)
        System.out.println("Database URL configured: " + properties.getUrl());
        System.out.println("Database User: " + properties.getUsername());
        
        return properties;
    }
}
