package com.gatewayapi.filter;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;

import com.gatewayapi.jwtUtils.JwtService;

import reactor.core.publisher.Mono;

@Component
public class JwtRelayFilter implements GlobalFilter,Ordered {

	
	@Autowired
	private JwtService jwt;
	
	@Override
	public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
		
		HttpHeaders headers=exchange.getRequest().getHeaders();
		String JWT=null;
		
		if(headers.get("Cookie") != null) {
			 for (String cookie : headers.get("Cookie")) {
	                if (cookie.contains("JWT-Token")) {
	                	JWT = cookie.substring(cookie.indexOf("JWT-Token=") + 10).split(";")[0];
	                    break;
	                }
		}
			 String userId="";
			 try {
				 userId=jwt.extractUserName(JWT);
			 }catch (Exception e) {
				 e.printStackTrace();
				 return chain.filter(exchange);
				 
			}
			 
				
				
				return chain.filter(exchange.mutate().request(exchange.getRequest().mutate()
						                    .header("X-Authenticated-User", userId)
						                    .header("Authorization", "Bearer " + JWT)
						                    .build()).build());
		
	}
		if (JWT == null || JWT.isBlank()) {
		    
		    return chain.filter(exchange); 
		}
		
		return null;
		
		

}

	@Override
	public int getOrder() {
		return 0;
	}
	
}
