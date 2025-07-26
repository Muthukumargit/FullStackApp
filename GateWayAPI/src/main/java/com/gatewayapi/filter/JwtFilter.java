package com.gatewayapi.filter;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpCookie;
import org.springframework.http.HttpHeaders;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.security.core.context.SecurityContextImpl;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;

import com.gatewayapi.Service.MyUserDetailsService;
import com.gatewayapi.jwtUtils.JwtService;

import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Mono;


@Slf4j
@Component
public class JwtFilter implements WebFilter {
    @Autowired
    private MyUserDetailsService userDetailsService;

    @Autowired
    private JwtService jwtService;
    
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getURI().getPath();

        if (path.equals("/login") || path.equals("/register") || path.startsWith("/UI/")) {
            return chain.filter(exchange);
        }

        String token = extractTokenFromCookie(exchange); 
        if (token == null) {
            return chain.filter(exchange); 
        }

        String username = extractUsernameFromToken(token);
        if (username == null) {
            return chain.filter(exchange); 
        }

        return userDetailsService.findByUsername(username)
            .filter(userDetails -> jwtService.validateToken(token, userDetails))
            .flatMap(userDetails -> {
            	log.info("user details inside flatMap"+userDetails.toString());
                Authentication authToken = new UsernamePasswordAuthenticationToken(
                        userDetails, null, null);
                SecurityContextImpl securityContext = new SecurityContextImpl(authToken);
                return chain.filter(exchange)
                            .contextWrite(ReactiveSecurityContextHolder.withSecurityContext(Mono.just(securityContext)));
            })
            .switchIfEmpty(chain.filter(exchange)); 
    }


    private String extractTokenFromCookie(ServerWebExchange exchange) {
		HttpCookie jwtCookie=exchange.getRequest().getCookies().getFirst("JWT-Token");
		
		return jwtCookie !=null ? jwtCookie.getValue() : null;
	}

	private String extractToken(ServerHttpRequest request) {
        List<String> authHeaders = request.getHeaders().getOrEmpty(HttpHeaders.AUTHORIZATION);
        if (!authHeaders.isEmpty() && authHeaders.get(0).startsWith("Bearer ")) {
            return authHeaders.get(0).substring(7);
        }
        return null;
    }

    private String extractUsernameFromToken(String token) {
        return token != null ? jwtService.extractUserName(token) : null;
    }
}
