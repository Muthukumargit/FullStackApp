package com.gatewayapi.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.ReactiveAuthenticationManager;
import org.springframework.security.authentication.UserDetailsRepositoryReactiveAuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.SecurityWebFiltersOrder;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.core.userdetails.ReactiveUserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.security.web.server.context.NoOpServerSecurityContextRepository;
import org.springframework.security.web.server.csrf.CookieServerCsrfTokenRepository;
import org.springframework.web.reactive.function.server.RouterFunction;
import org.springframework.web.reactive.function.server.RouterFunctions;
import org.springframework.web.reactive.function.server.ServerResponse;

import com.gatewayapi.filter.JwtFilter;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {
	
	@Autowired
	private ReactiveUserDetailsService userDetailsService;
	
	@Autowired
	private JwtFilter jwtFilter;
	
	@Bean
	public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http) {
		return http 
				.httpBasic(httpBasic -> httpBasic.disable())
				.formLogin(formLogin -> formLogin.disable())
				.csrf(csrf -> csrf.disable())
				   .authorizeExchange(exchange -> exchange
						   .pathMatchers("/register","/login","/logout","/verifyUserId","/UI/**")
						   .permitAll()
						   .anyExchange().authenticated()
				   )
				   .exceptionHandling(exceptionHandlingSpec ->
                   exceptionHandlingSpec
                           .authenticationEntryPoint((exchange, ex) -> {
                               // Prevent browser basic auth popup
                               exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
                               return exchange.getResponse().setComplete();
                           })
           )
				   .securityContextRepository(NoOpServerSecurityContextRepository.getInstance())
				   .addFilterAt(jwtFilter, SecurityWebFiltersOrder.AUTHENTICATION)
				   .build();
		
	}
	 @Bean
	 public ReactiveAuthenticationManager reactiveAuthenticationManager() {
	        UserDetailsRepositoryReactiveAuthenticationManager authManager =
	                new UserDetailsRepositoryReactiveAuthenticationManager(userDetailsService);
	        authManager.setPasswordEncoder(new BCryptPasswordEncoder(12));
	        return authManager;
	    }
	 

	 

}
