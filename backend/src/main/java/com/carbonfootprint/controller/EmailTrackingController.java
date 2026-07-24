package com.carbonfootprint.controller;

import com.carbonfootprint.entity.EmailLog;
import com.carbonfootprint.repository.EmailLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.Optional;

@RestController
@RequestMapping("/api/track")
@RequiredArgsConstructor
@Slf4j
public class EmailTrackingController {

    private final EmailLogRepository emailLogRepository;

    // A transparent 1x1 GIF pixel
    private static final byte[] PIXEL = new byte[]{
            71, 73, 70, 56, 57, 97, 1, 0, 1, 0, (byte) 128, 0, 0, 0, 0, 0,
            (byte) 255, (byte) 255, (byte) 255, 33, (byte) 249, 4, 1, 0, 0, 0,
            0, 44, 0, 0, 0, 0, 1, 0, 1, 0, 0, 2, 2, 68, 1, 0, 59
    };

    @GetMapping("/open/{trackingId}.gif")
    public ResponseEntity<Resource> trackOpen(@PathVariable String trackingId) {
        Optional<EmailLog> optionalEmail = emailLogRepository.findByTrackingId(trackingId);
        
        if (optionalEmail.isPresent()) {
            EmailLog emailLog = optionalEmail.get();
            if (!emailLog.isOpened()) {
                emailLog.setOpened(true);
                emailLogRepository.save(emailLog);
                log.info("Email tracking ID {} marked as OPENED.", trackingId);
            }
        } else {
            log.warn("Tracking ID {} not found for open event.", trackingId);
        }

        ByteArrayResource resource = new ByteArrayResource(PIXEL);
        return ResponseEntity.ok()
                .header(HttpHeaders.CACHE_CONTROL, "no-cache, no-store, must-revalidate")
                .header(HttpHeaders.PRAGMA, "no-cache")
                .header(HttpHeaders.EXPIRES, "0")
                .contentType(MediaType.IMAGE_GIF)
                .contentLength(PIXEL.length)
                .body(resource);
    }

    @GetMapping("/click/{trackingId}")
    public ResponseEntity<Void> trackClick(@PathVariable String trackingId, @RequestParam("url") String url) {
        Optional<EmailLog> optionalEmail = emailLogRepository.findByTrackingId(trackingId);
        
        if (optionalEmail.isPresent()) {
            EmailLog emailLog = optionalEmail.get();
            if (!emailLog.isClicked()) {
                emailLog.setClicked(true);
                emailLogRepository.save(emailLog);
                log.info("Email tracking ID {} marked as CLICKED.", trackingId);
            }
        } else {
            log.warn("Tracking ID {} not found for click event.", trackingId);
        }

        return ResponseEntity.status(HttpStatus.FOUND)
                .location(URI.create(url))
                .build();
    }
}
