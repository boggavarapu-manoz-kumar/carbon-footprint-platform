package com.carbonfootprint.controller;

import com.carbonfootprint.response.ApiResponse;
import jakarta.servlet.RequestDispatcher;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Slf4j
@Controller
public class CustomErrorController implements ErrorController {

    @Value("${app.frontend.url:${FRONTEND_URL:http://localhost:5173}}")
    private String frontendUrl;

    @RequestMapping("/error")
    public Object handleError(HttpServletRequest request, HttpServletResponse response) throws IOException {
        Object status = request.getAttribute(RequestDispatcher.ERROR_STATUS_CODE);
        Object message = request.getAttribute(RequestDispatcher.ERROR_MESSAGE);
        Object exception = request.getAttribute(RequestDispatcher.ERROR_EXCEPTION);

        int statusCode = HttpStatus.INTERNAL_SERVER_ERROR.value();
        if (status != null) {
            try {
                statusCode = Integer.parseInt(status.toString());
            } catch (NumberFormatException ignored) {
            }
        }

        String rawMessage = message != null ? message.toString() : "";
        String errorMessage = "Authentication or server request could not be completed. Please try again.";

        if (exception instanceof Throwable) {
            Throwable rootCause = (Throwable) exception;
            while (rootCause.getCause() != null && rootCause.getCause() != rootCause) {
                rootCause = rootCause.getCause();
            }
            if (rootCause.getMessage() != null && !rootCause.getMessage().isEmpty()) {
                errorMessage = rootCause.getMessage();
            }
        } else if (!rawMessage.isEmpty() && !"No message available".equalsIgnoreCase(rawMessage) && !rawMessage.toLowerCase().contains("filter execution")) {
            errorMessage = rawMessage;
        }

        log.warn("CustomErrorController intercepted error: HTTP {} - {} (Raw: {})", statusCode, errorMessage, rawMessage);

        String acceptHeader = request.getHeader("Accept");
        String uri = request.getRequestURI();
        boolean isApiOrJson = (acceptHeader != null && acceptHeader.contains("application/json")) ||
                              (uri != null && uri.startsWith("/api/"));

        if (isApiOrJson) {
            return ResponseEntity.status(statusCode).body(ApiResponse.error(errorMessage));
        }

        // For browser requests, gracefully redirect back to frontend login with message
        String encodedMsg = URLEncoder.encode(errorMessage, StandardCharsets.UTF_8);
        String targetUrl = frontendUrl.replaceAll("/+$", "") + "/login?error=" + encodedMsg;
        response.sendRedirect(targetUrl);
        return null;
    }
}
