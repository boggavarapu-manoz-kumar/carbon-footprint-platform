package com.carbonfootprint.service.admin;

import com.carbonfootprint.entity.admin.PlatformSetting;
import com.carbonfootprint.repository.admin.PlatformSettingRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PlatformSettingService {

    private final PlatformSettingRepository settingRepository;

    @PostConstruct
    public void initDefaultSettings() {
        List<PlatformSetting> defaults = List.of(
            PlatformSetting.builder().key("platform.name").value("Carbon Footprint Platform").description("The name of the platform").type("STRING").build(),
            PlatformSetting.builder().key("platform.maintenanceMode").value("false").description("Enable maintenance mode").type("BOOLEAN").build(),
            PlatformSetting.builder().key("platform.timezone").value("UTC").description("Default timezone").type("STRING").build(),
            PlatformSetting.builder().key("platform.language").value("en").description("System language").type("STRING").build(),
            PlatformSetting.builder().key("security.mfaRequired").value("false").description("Require MFA for all users").type("BOOLEAN").build(),
            PlatformSetting.builder().key("security.sessionTimeout").value("60").description("Session timeout in minutes").type("NUMBER").build(),
            PlatformSetting.builder().key("gemini.apiKey").value("").description("Gemini API Key for AI Insights").type("STRING").build()
        );
        for (PlatformSetting defaultSetting : defaults) {
            if (!settingRepository.existsById(defaultSetting.getKey())) {
                settingRepository.save(defaultSetting);
            }
        }
    }

    public List<PlatformSetting> getAllSettings() {
        return settingRepository.findAll();
    }

    public Map<String, String> getSettingsAsMap() {
        return settingRepository.findAll().stream()
                .collect(Collectors.toMap(PlatformSetting::getKey, PlatformSetting::getValue));
    }

    public String getSettingValue(String key) {
        return settingRepository.findById(key).map(PlatformSetting::getValue).orElse(null);
    }

    @Transactional
    public void updateSettings(Map<String, String> updates) {
        updates.forEach((key, value) -> {
            settingRepository.findById(key).ifPresent(setting -> {
                setting.setValue(value);
                settingRepository.save(setting);
            });
        });
    }

    @Transactional
    public void purgeCache() {
        // Mocking cache purge operation
        System.out.println("Executing system cache purge...");
    }
}
