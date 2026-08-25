package com.carbonfootprint.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URI;

@Configuration
@Slf4j
public class DataSourceConfig {

    @Value("${SPRING_DATASOURCE_URL:${DATABASE_URL:jdbc:mysql://localhost:3306/carbon_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true&rewriteBatchedStatements=true&cachePrepStmts=true&prepStmtCacheSize=250&prepStmtCacheSqlLimit=2048}}")
    private String rawUrl;

    @Value("${SPRING_DATASOURCE_USERNAME:root}")
    private String username;

    @Value("${SPRING_DATASOURCE_PASSWORD:}")
    private String password;

    @Value("${SPRING_DATASOURCE_DRIVER_CLASS_NAME:}")
    private String driverClassName;

    @Value("${HIKARI_MAX_POOL_SIZE:50}")
    private int maxPoolSize;

    @Value("${HIKARI_MIN_IDLE:10}")
    private int minIdle;

    @Bean
    @Primary
    public DataSource dataSource() {
        HikariConfig config = new HikariConfig();
        
        String effectiveUrl = rawUrl;
        String effectiveUsername = username;
        String effectivePassword = password;
        String effectiveDriver = driverClassName;

        // Automatically convert standard cloud PostgreSQL URLs (e.g., from Render, Heroku, Railway, Supabase)
        // Format: postgres://user:password@host:port/database OR postgresql://user:password@host:port/database
        if (rawUrl.startsWith("postgres://") || rawUrl.startsWith("postgresql://")) {
            try {
                URI uri = new URI(rawUrl);
                String host = uri.getHost();
                int port = uri.getPort() != -1 ? uri.getPort() : 5432;
                String path = uri.getPath(); // /database
                String dbName = (path != null && path.length() > 1) ? path.substring(1) : "carbon_db";

                effectiveUrl = String.format("jdbc:postgresql://%s:%d/%s", host, port, dbName);
                if (uri.getQuery() != null && !uri.getQuery().isEmpty()) {
                    effectiveUrl += "?" + uri.getQuery();
                }

                if (uri.getUserInfo() != null) {
                    String[] userInfo = uri.getUserInfo().split(":", 2);
                    effectiveUsername = userInfo[0];
                    if (userInfo.length > 1) {
                        effectivePassword = userInfo[1];
                    }
                }
                effectiveDriver = "org.postgresql.Driver";
                log.info("Converted cloud PostgreSQL URL to JDBC: jdbc:postgresql://{}:{}/{}", host, port, dbName);
            } catch (Exception e) {
                log.error("Failed to parse PostgreSQL URI: {}. Falling back to raw URL.", rawUrl, e);
            }
        }

        // Determine driver if not explicitly specified
        if (effectiveDriver == null || effectiveDriver.trim().isEmpty()) {
            if (effectiveUrl.contains("postgresql") || effectiveUrl.contains("postgres")) {
                effectiveDriver = "org.postgresql.Driver";
            } else if (effectiveUrl.contains("mysql")) {
                effectiveDriver = "com.mysql.cj.jdbc.Driver";
            }
        }

        config.setJdbcUrl(effectiveUrl);
        config.setUsername(effectiveUsername);
        config.setPassword(effectivePassword);
        if (effectiveDriver != null && !effectiveDriver.trim().isEmpty()) {
            config.setDriverClassName(effectiveDriver);
        }

        config.setMaximumPoolSize(maxPoolSize);
        config.setMinimumIdle(minIdle);
        config.setIdleTimeout(300000);
        config.setConnectionTimeout(20000);
        config.setMaxLifetime(1200000);
        config.setPoolName("CarbonFootprintHikariPool");

        log.info("Initialized DataSource for URL: {} with driver: {}", effectiveUrl, effectiveDriver);
        return new HikariDataSource(config);
    }
}
