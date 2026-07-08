package com.carbonfootprint.config;

import org.slf4j.MDC;
import org.springframework.core.task.TaskDecorator;
import org.springframework.lang.NonNull;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Map;

/**
 * Decorates asynchronous tasks to ensure MDC (Mapped Diagnostic Context)
 * and SecurityContext are propagated from the calling thread to the async thread.
 */
public class MdcTaskDecorator implements TaskDecorator {

    @Override
    @NonNull
    public Runnable decorate(@NonNull Runnable runnable) {
        // Capture context from the calling thread
        Map<String, String> contextMap = MDC.getCopyOfContextMap();
        SecurityContext securityContext = SecurityContextHolder.getContext();

        return () -> {
            try {
                // Apply context to the async thread
                if (contextMap != null) {
                    MDC.setContextMap(contextMap);
                }
                if (securityContext != null) {
                    SecurityContextHolder.setContext(securityContext);
                }
                runnable.run();
            } finally {
                // Clear context to prevent leaks in thread pool
                MDC.clear();
                SecurityContextHolder.clearContext();
            }
        };
    }
}
