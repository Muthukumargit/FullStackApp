package com.userservice.filter;

import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;

import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Mono;

@Slf4j
@Component
public class GatewayFilter implements WebFilter {

	@Override
	public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
		
		 ServerHttpRequest request = exchange.getRequest();
		    String upgrade = request.getHeaders().getFirst("Upgrade");

		    if ("websocket".equalsIgnoreCase(upgrade)) {
		        String userId = request.getQueryParams().getFirst("userId");
		        if (userId == null || userId.isBlank()) {
		            exchange.getResponse().setStatusCode(HttpStatus.FORBIDDEN);
		            return exchange.getResponse().setComplete();
		        }
		        return chain.filter(exchange);
		    }
		
		String userId = request.getHeaders().getFirst("X-Authenticated-User");
		
		if(userId.isEmpty() || userId.isBlank()) {
			exchange.getResponse().setStatusCode(HttpStatus.FORBIDDEN);
			return exchange.getResponse().setComplete();
		}
		
		return chain.filter(exchange);
	}

}
