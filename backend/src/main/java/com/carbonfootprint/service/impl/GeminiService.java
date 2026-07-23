package com.carbonfootprint.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.RestClientException;

import org.springframework.web.client.HttpStatusCodeException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import com.carbonfootprint.service.admin.PlatformSettingService;

@Service
@RequiredArgsConstructor
@Slf4j
public class GeminiService {

    @Value("${GEMINI_API_URL:https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent}")
    private String geminiApiUrl;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper;
    private final PlatformSettingService platformSettingService;

    // Circuit Breaker State
    private boolean isHealthy = true;
    private String lastErrorReason = null;
    private String lastErrorMessage = null;
    private LocalDateTime lastErrorTime = null;
    private static final int COOLDOWN_MINUTES = 2; // Auto-retry after 2 minutes

    public Map<String, String> getHealthStatus() {
        Map<String, String> status = new HashMap<>();
        status.put("status", isHealthy ? "ONLINE" : "OFFLINE");
        status.put("reason", lastErrorReason != null ? lastErrorReason : "");
        status.put("lastError", lastErrorMessage != null ? lastErrorMessage : "");
        status.put("time", lastErrorTime != null ? lastErrorTime.format(DateTimeFormatter.ISO_DATE_TIME) : "");
        return status;
    }

    public String generateAIResponse(String prompt) {
        String geminiApiKey = platformSettingService.getSettingValue("gemini.apiKey");
        
        if (geminiApiKey == null || geminiApiKey.trim().isEmpty()) {
            log.warn("GEMINI_API_KEY is not configured in settings. Falling back to local generation.");
            return null;
        }

        // Circuit Breaker: Check if we are OFFLINE and if cooldown has elapsed
        if (!isHealthy) {
            if (lastErrorTime != null && LocalDateTime.now().isAfter(lastErrorTime.plusMinutes(COOLDOWN_MINUTES))) {
                log.info("Gemini Circuit Breaker: Cooldown elapsed. Attempting HALF-OPEN retry.");
                // We don't set isHealthy to true yet, we just allow the request to proceed. 
                // If it succeeds, it will reset the state at the end.
            } else {
                log.warn("Gemini Circuit Breaker: API is OFFLINE. Fast-failing to Local Engine.");
                return null;
            }
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> requestBody = new HashMap<>();
            Map<String, Object> part = new HashMap<>();
            part.put("text", prompt);
            Map<String, Object> content = new HashMap<>();
            content.put("parts", List.of(part));
            requestBody.put("contents", List.of(content));

            Map<String, Object> generationConfig = new HashMap<>();
            generationConfig.put("temperature", 0.7);
            generationConfig.put("responseMimeType", "application/json");
            requestBody.put("generationConfig", generationConfig);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            String url = geminiApiUrl + "?key=" + geminiApiKey;
            
            log.debug("Calling Gemini API with prompt length: {}", prompt.length());
            String response = restTemplate.postForObject(url, entity, String.class);
            
            if (response != null) {
                JsonNode root = objectMapper.readTree(response);
                JsonNode candidates = root.path("candidates");
                if (candidates.isArray() && candidates.size() > 0) {
                    JsonNode parts = candidates.get(0).path("content").path("parts");
                    if (parts.isArray() && parts.size() > 0) {
                        // Success: Reset Circuit Breaker
                        if (!isHealthy) {
                            log.info("Gemini Circuit Breaker: API recovered. Transitioning to ONLINE.");
                        }
                        isHealthy = true;
                        lastErrorReason = null;
                        lastErrorMessage = null;
                        lastErrorTime = null;
                        
                        return parts.get(0).path("text").asText();
                    }
                }
            }
        } catch (HttpStatusCodeException e) {
            isHealthy = false;
            lastErrorTime = LocalDateTime.now();
            lastErrorMessage = e.getMessage();
            int status = e.getStatusCode().value();
            if (status == 401 || status == 403) {
                lastErrorReason = "Invalid or Expired API Key";
            } else if (status == 429) {
                lastErrorReason = "Rate Limit Exceeded";
            } else if (status >= 500) {
                lastErrorReason = "Gemini Server Error (" + status + ")";
            } else {
                lastErrorReason = "HTTP Error " + status;
            }
            log.error("Gemini API failed with HTTP {}: {}. Circuit Breaker OPEN.", status, lastErrorReason);
        } catch (RestClientException e) {
            isHealthy = false;
            lastErrorTime = LocalDateTime.now();
            lastErrorReason = "Network Failure / Timeout";
            lastErrorMessage = e.getMessage();
            log.error("Gemini API network failure: {}. Circuit Breaker OPEN.", e.getMessage());
        } catch (Exception e) {
            isHealthy = false;
            lastErrorTime = LocalDateTime.now();
            lastErrorReason = "Unexpected Error";
            lastErrorMessage = e.getMessage();
            log.error("Error parsing Gemini API response: {}. Circuit Breaker OPEN.", e.getMessage());
        }
        
        return null;
    }
}
