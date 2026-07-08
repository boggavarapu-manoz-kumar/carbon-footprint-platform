package com.carbonfootprint.config;

import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.binder.jvm.ExecutorServiceMetrics;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;
import java.util.concurrent.ThreadPoolExecutor;

@Configuration
@EnableAsync
public class AsyncConfig {

    @Autowired(required = false)
    private MeterRegistry meterRegistry;

    @Bean(name = "auditLogExecutor")
    public Executor auditLogExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(10);
        executor.setMaxPoolSize(50);
        executor.setQueueCapacity(10000);
        executor.setThreadNamePrefix("AuditLog-");
        
        // Use CallerRunsPolicy to apply backpressure instead of discarding logs
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        
        // Graceful shutdown to prevent log loss when shutting down
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(60);
        
        // Attach the TaskDecorator for MDC and SecurityContext propagation
        executor.setTaskDecorator(new MdcTaskDecorator());
        
        executor.initialize();
        
        // Register with Micrometer if available for metrics monitoring
        if (meterRegistry != null) {
            return ExecutorServiceMetrics.monitor(meterRegistry, executor.getThreadPoolExecutor(), "auditLogExecutor");
        }
        
        return executor;
    }
}
