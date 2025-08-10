package com.gatewayapi.filter;

import java.nio.charset.StandardCharsets;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;

import com.cipher.CipherUtils;
import com.gatewayapi.jwtUtils.EmailJwtService;
import com.gatewayapi.jwtUtils.JwtService;

import reactor.core.publisher.Mono;

@Component
public class EmailVerificationFilter implements WebFilter{

//    private final JwtService jwtService;
	
	@Autowired
	private EmailJwtService emailJwt;

	@Override
	public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
		// TODO Auto-generated method stub
		
		   if (exchange.getRequest().getURI().getPath().equals("/emailVerification")) {
	            String token = exchange.getRequest().getQueryParams().getFirst("verificationToken");
//	            System.out.println("token :: "+token);
	            if (token == null || token.isEmpty()) {
	                exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
	                return exchange.getResponse().setComplete();
	            }
	            else {
	            	  ServerHttpResponse response = exchange.getResponse();
	            	  String message = "";
	            	
	            	try {
	            		emailJwt.validateEmailToken(token);
	            		message = "Validated Successfully...!";
	                      response.setStatusCode(HttpStatus.ACCEPTED);
	                      response.getHeaders().setContentType(MediaType.TEXT_PLAIN);
	                      DataBuffer buffer = response.bufferFactory().wrap(message.getBytes(StandardCharsets.UTF_8));
	                      return response.writeWith(Mono.just(buffer));
	            	}catch (Exception e) {
	                      response.setStatusCode(HttpStatus.FORBIDDEN);
	                      response.getHeaders().setContentType(MediaType.TEXT_PLAIN);
	                      message = "Validation Failed...!";
	                      DataBuffer buffer = response.bufferFactory().wrap(message.getBytes(StandardCharsets.UTF_8));
	                      return response.writeWith(Mono.just(buffer));
					}
	            }
	}
		   return chain.filter(exchange);
	}

}
