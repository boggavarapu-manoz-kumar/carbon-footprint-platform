package com.carbonfootprint.aspect;

import com.carbonfootprint.annotation.Auditable;
import com.carbonfootprint.entity.admin.AuditLog;
import com.carbonfootprint.repository.admin.AuditLogRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

@Aspect
@Component
@RequiredArgsConstructor
@Slf4j
public class AuditLogAspect {

    private final AuditLogRepository auditLogRepository;
    private final ObjectMapper objectMapper;

    @Around("@annotation(auditable)")
    public Object auditAction(ProceedingJoinPoint joinPoint, Auditable auditable) throws Throwable {
        String actor = getCurrentUser();
        String ipAddress = getClientIp();
        String deviceInfo = getDeviceInfo();

        // Capture arguments before execution
        String newValue = serializeArguments(joinPoint);
        String resourceId = extractResourceId(joinPoint, auditable.idParamName());

        // Execute the method
        Object result;
        try {
            result = joinPoint.proceed();
        } catch (Throwable e) {
            // Log failure asynchronously and rethrow
            saveAuditLogAsync(actor, auditable.action() + "_FAILED", auditable.resource(), resourceId, null, newValue, ipAddress, deviceInfo);
            throw e;
        }

        // Log success asynchronously
        saveAuditLogAsync(actor, auditable.action(), auditable.resource(), resourceId, null, newValue, ipAddress, deviceInfo);

        return result;
    }

    @Async
    public CompletableFuture<Void> saveAuditLogAsync(String actor, String action, String resource, String resourceId,
                                                     String oldValue, String newValue, String ipAddress, String deviceInfo) {
        try {
            AuditLog auditLog = AuditLog.builder()
                    .actor(actor)
                    .action(action)
                    .resource(resource)
                    .resourceId(resourceId)
                    .oldValue(oldValue)
                    .newValue(newValue)
                    .ipAddress(ipAddress)
                    .deviceInfo(deviceInfo)
                    .build();
            auditLogRepository.save(auditLog);
        } catch (Exception e) {
            log.error("Failed to save audit log: {}", e.getMessage(), e);
        }
        return CompletableFuture.completedFuture(null);
    }

    private String getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated() && !authentication.getPrincipal().equals("anonymousUser")) {
            return authentication.getName();
        }
        return "SYSTEM";
    }

    private String getClientIp() {
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                String ip = request.getHeader("X-Forwarded-For");
                if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
                    ip = request.getRemoteAddr();
                }
                return ip;
            }
        } catch (Exception ignored) {}
        return "UNKNOWN";
    }

    private String getDeviceInfo() {
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                return request.getHeader("User-Agent");
            }
        } catch (Exception ignored) {}
        return "UNKNOWN";
    }

    private String serializeArguments(ProceedingJoinPoint joinPoint) {
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        String[] parameterNames = signature.getParameterNames();
        Object[] args = joinPoint.getArgs();

        Map<String, Object> argMap = new HashMap<>();
        for (int i = 0; i < parameterNames.length; i++) {
            // Avoid serializing huge objects or recursive entities, limit to DTOs or primitives
            if (args[i] != null && !args[i].getClass().getName().startsWith("org.springframework")) {
                 argMap.put(parameterNames[i], args[i]);
            }
        }

        try {
            return objectMapper.writeValueAsString(argMap);
        } catch (JsonProcessingException e) {
            return "{\"error\": \"Could not serialize arguments\"}";
        }
    }

    private String extractResourceId(ProceedingJoinPoint joinPoint, String idParamName) {
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        String[] parameterNames = signature.getParameterNames();
        Object[] args = joinPoint.getArgs();

        for (int i = 0; i < parameterNames.length; i++) {
            if (parameterNames[i].equals(idParamName) && args[i] != null) {
                return String.valueOf(args[i]);
            }
        }
        return null;
    }
}
