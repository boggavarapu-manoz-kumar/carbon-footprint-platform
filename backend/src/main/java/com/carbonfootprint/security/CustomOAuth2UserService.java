package com.carbonfootprint.security;

import com.carbonfootprint.entity.AuthProvider;
import com.carbonfootprint.entity.Role;
import com.carbonfootprint.entity.User;
import com.carbonfootprint.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        try {
            OAuth2User oAuth2User = super.loadUser(userRequest);

            String email = oAuth2User.getAttribute("email");
            String name = oAuth2User.getAttribute("name");
            String givenName = oAuth2User.getAttribute("given_name");
            String familyName = oAuth2User.getAttribute("family_name");
            String picture = oAuth2User.getAttribute("picture");
            String providerId = oAuth2User.getAttribute("sub"); // Google's unique ID

            if (email == null || email.trim().isEmpty()) {
                log.error("Email attribute missing from Google OAuth2 payload");
                throw new OAuth2AuthenticationException("Email not found from OAuth2 provider");
            }

            email = email.trim().toLowerCase();
            Optional<User> userOptional = userRepository.findByEmail(email);

            User user;
            if (userOptional.isPresent()) {
                user = userOptional.get();
                log.info("Existing user logged in via OAuth2: {}", email);

                boolean updated = false;
                if (user.getProvider() == null || user.getProvider() == AuthProvider.LOCAL) {
                    user.setProvider(AuthProvider.GOOGLE);
                    user.setProviderId(providerId);
                    updated = true;
                }
                if ((user.getProfilePictureUrl() == null || user.getProfilePictureUrl().isEmpty()) && picture != null) {
                    user.setProfilePictureUrl(picture);
                    updated = true;
                }
                if (updated) {
                    user = userRepository.save(user);
                }
            } else {
                log.info("Registering new user via OAuth2: {}", email);
                String firstName = (givenName != null && !givenName.trim().isEmpty()) ? givenName.trim() : "User";
                String lastName = (familyName != null && !familyName.trim().isEmpty()) ? familyName.trim() : "";

                if (lastName.isEmpty() && name != null && !name.trim().isEmpty()) {
                    String[] parts = name.trim().split("\\s+", 2);
                    firstName = parts[0];
                    if (parts.length > 1) {
                        lastName = parts[1];
                    }
                }
                if (firstName.length() > 50) firstName = firstName.substring(0, 50);
                if (lastName.length() > 50) lastName = lastName.substring(0, 50);

                String base = email.split("@")[0].replaceAll("[^a-zA-Z0-9_]", "");
                if (base.isEmpty()) base = "user";
                if (base.length() > 15) base = base.substring(0, 15);
                
                String candidateUsername = base + "_" + (System.currentTimeMillis() % 10000);
                int retry = 0;
                while (userRepository.findByUsername(candidateUsername).isPresent() && retry < 10) {
                    candidateUsername = base + "_" + UUID.randomUUID().toString().replace("-", "").substring(0, 6);
                    retry++;
                }

                // Use random encrypted password hash so database NOT NULL constraint will never fail
                String randomRawPassword = UUID.randomUUID().toString();
                String encodedPassword = passwordEncoder.encode(randomRawPassword);

                user = User.builder()
                        .email(email)
                        .firstName(firstName)
                        .lastName(lastName.isEmpty() ? " " : lastName)
                        .username(candidateUsername)
                        .mobileNumber("")
                        .gender("")
                        .profilePictureUrl(picture != null ? picture : "https://api.dicebear.com/9.x/bottts/svg?seed=" + candidateUsername)
                        .provider(AuthProvider.GOOGLE)
                        .providerId(providerId)
                        .role(Role.USER)
                        .isSuspended(false)
                        .password(encodedPassword)
                        .build();

                user = userRepository.save(user);
            }

            return new CustomOAuth2User(user, oAuth2User.getAttributes());
        } catch (OAuth2AuthenticationException e) {
            throw e;
        } catch (Exception e) {
            log.error("Fatal exception during CustomOAuth2UserService.loadUser: ", e);
            throw new OAuth2AuthenticationException("Failed to process Google OAuth2 user account: " + e.getMessage());
        }
    }
}
