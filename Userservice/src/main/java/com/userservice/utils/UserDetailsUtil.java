package com.userservice.utils;

import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;

@Component
public class UserDetailsUtil {
	
	public String getUserid(ServerWebExchange exchange) {
		ServerHttpRequest request= exchange.getRequest();		
		return exchange.getRequest().getHeaders().getFirst("X-Authenticated-User");
	}

}
