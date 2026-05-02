package com.haui.vtech.config;

import com.haui.vtech.security.CustomUserDetailsService;
import com.haui.vtech.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final CustomUserDetailsService userDetailsService;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource())) // 1. THÊM DÒNG NÀY ĐẦU TIÊN
                .csrf(AbstractHttpConfigurer::disable) // Tắt CSRF vì dùng JWT
                .authorizeHttpRequests(auth -> auth
                        // 1. Mở toàn bộ cho nhóm API Xác thực
                        .requestMatchers("/api/v1/auth/**").permitAll()

                        // 2. Mở cửa CHỈ VỚI METHOD GET cho các API dữ liệu công khai (Storefront)
                        .requestMatchers(org.springframework.http.HttpMethod.GET,
                                "/api/v1/products/**",
                                "/api/v1/categories/**",
                                "/api/v1/brands/**",
                                "/api/v1/product-variants/**",
                                "/api/v1/colors/**",
                                "/api/v1/versions/**",
                                "/api/v1/tags/**",
                                // Bạn có thể giữ permitAll cho một số API GET tĩnh của client (như home page, list sp)
                                "/api/v1/client/products/**",
                                "/api/v1/client/categories/**",
                                "/api/v1/client/articles/**",
                                "/api/v1/client/promotions/**"
                        ).permitAll()

                        // CÁC ENDPOINT CẦN LOGIN
                        .requestMatchers(
                                "/api/v1/client/cart/**",
                                "/api/v1/client/orders/**",
                                "/api/v1/client/addresses/**",
                                "/api/v1/vpoint/**")
                        .authenticated()
                        // 3. Các request còn lại (POST, PUT, DELETE của sản phẩm, hoặc mọi request tới users, orders...) BẮT BUỘC ĐĂNG NHẬP
                        .anyRequest().authenticated()
                )
                .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS)) // Không lưu session
                .authenticationProvider(authenticationProvider())
                // Thêm JwtFilter chạy trước khi UsernamePasswordAuthenticationFilter chạy
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // 2. Cho phép Frontend ở cổng 5173 truy cập (Nếu deploy thực tế thì đổi thành domain thật)
        configuration.setAllowedOrigins(List.of("http://localhost:5173"));

        // 3. Cho phép các method. Đặc biệt phải có OPTIONS để qua mặt Preflight
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));

        // 4. Cho phép các Header này đi qua
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Accept", "Accept-Language"));

        // 5. Bắt buộc bằng true nếu bạn có dùng Token đính trong Header hoặc Cookie
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration); // Áp dụng CORS cho toàn bộ API
        return source;
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(10); // Mã hóa mật khẩu chuẩn nhất hiện nay
    }
}