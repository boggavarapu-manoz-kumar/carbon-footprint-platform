package com.carbonfootprint.security;

import com.carbonfootprint.entity.AuthProvider;
import com.carbonfootprint.entity.Role;
import com.carbonfootprint.entity.User;
import com.carbonfootprint.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String picture = oAuth2User.getAttribute("picture");
        String providerId = oAuth2User.getAttribute("sub"); // Google's unique ID

        if (email == null) {
            log.error("Email not found from OAuth2 provider");
            throw new OAuth2AuthenticationException("Email not found from OAuth2 provider");
        }

        Optional<User> userOptional = userRepository.findByEmail(email);

        User user;
        if (userOptional.isPresent()) {
            user = userOptional.get();
            log.info("Existing user logged in via OAuth2: {}", email);
            // Optional: update profile picture or name if needed
            if (picture != null && !picture.equals(user.getProfilePictureUrl())) {
                user.setProfilePictureUrl(picture);
                user = userRepository.save(user);
            }
        } else {
            log.info("Registering new user via OAuth2: {}", email);
            String firstName = "Unknown";
            String lastName = "Unknown";
            if (name != null) {
                String[] parts = name.split(" ", 2);
                firstName = parts[0];
                if (parts.length > 1) {
                    lastName = parts[1];
                }
            }
            String username = email.split("@")[0].replaceAll("[^a-zA-Z0-9_.]", "") + "_" + System.currentTimeMillis() % 1000;

            user = User.builder()
                    .email(email)
                    .firstName(firstName)
                    .lastName(lastName)
                    .username(username)
                    .mobileNumber("")
                    .gender("")
                    .profilePictureUrl(picture)
                    .provider(AuthProvider.GOOGLE)
                    .providerId(providerId)
                    .role(Role.USER)
                    // Password can be null because of our entity update
                    .password(null)
                    .build();
            user = userRepository.save(user);
        }

        return new CustomOAuth2User(user, oAuth2User.getAttributes());
    }
}
