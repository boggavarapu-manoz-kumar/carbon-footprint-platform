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
import org.springframework.web.bind.annotation.ResponseBody;

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

        String errorMessage = message != null ? message.toString() : "An unexpected server error occurred";
        if (exception != null && (errorMessage.isEmpty() || "No message available".equals(errorMessage))) {
            if (exception instanceof Throwable) {
                errorMessage = ((Throwable) exception).getMessage();
            }
        }

        log.warn("CustomErrorController intercepted error: HTTP {} - {}", statusCode, errorMessage);

        String acceptHeader = request.getHeader("Accept");
        boolean isApiOrJson = (acceptHeader != null && acceptHeader.contains("application/json")) ||
                              request.getRequestURI().startsWith("/api/");

        if (isApiOrJson) {
            return ResponseEntity.status(statusCode).body(ApiResponse.error(errorMessage));
        }

        // For browser requests, gracefully redirect back to frontend application
        String encodedMsg = URLEncoder.encode(errorMessage, StandardCharsets.UTF_8);
        String targetUrl = frontendUrl.replaceAll("/+$", "") + "/login?error=" + encodedMsg;
        response.sendRedirect(targetUrl);
        return null;
    }
}
