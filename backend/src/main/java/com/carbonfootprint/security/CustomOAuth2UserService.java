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
        } else {
            log.info("Registering new user via OAuth2: {}", email);
            String firstName = "User";
            String lastName = "";
            if (name != null && !name.trim().isEmpty()) {
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
            if (base.length() > 18) base = base.substring(0, 18);
            String username = base + "_" + (System.currentTimeMillis() % 10000);

            user = User.builder()
                    .email(email)
                    .firstName(firstName)
                    .lastName(lastName.isEmpty() ? " " : lastName)
                    .username(username)
                    .mobileNumber("")
                    .gender("")
                    .profilePictureUrl(picture != null ? picture : "https://api.dicebear.com/9.x/bottts/svg?seed=" + username)
                    .provider(AuthProvider.GOOGLE)
                    .providerId(providerId)
                    .role(Role.USER)
                    .isSuspended(false)
                    .password(null)
                    .build();
            user = userRepository.save(user);
        }

        return new CustomOAuth2User(user, oAuth2User.getAttributes());
    }
}
