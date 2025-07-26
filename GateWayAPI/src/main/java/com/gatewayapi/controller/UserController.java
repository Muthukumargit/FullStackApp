package com.gatewayapi.controller;

import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.security.authentication.ReactiveAuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gatewayapi.Model.AuthRequest;
import com.gatewayapi.Model.Users;
import com.gatewayapi.Model.userprofileDto;
import com.gatewayapi.Service.UserService;
import com.gatewayapi.jwtUtils.JwtService;

import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Mono;

@Slf4j
@RestController
public class UserController {
	
	  private final UserService service;
	  private final ReactiveAuthenticationManager authManager;

	    public UserController(UserService service, ReactiveAuthenticationManager authManager) {
	        this.service = service;
	        this.authManager = authManager;
	    }
	
	@Autowired
	private JwtService jwt;
	
	@PostMapping("/register")
	public String register(@RequestBody userprofileDto user) {		
		return service.register(user);
	}

	@PostMapping("/login")
	public Mono<ResponseEntity<String>> login(@RequestBody AuthRequest authReq,ServerHttpResponse response){
//		log.info("auth ::"+authReq.toString());
		log.info("Entered to login in GatewayAPI");
		return authManager.authenticate(
	            new UsernamePasswordAuthenticationToken(authReq.getUserId(), authReq.getPassword())
	    ).flatMap(auth -> {
	        if (auth.isAuthenticated()) {
	        	List<String> roles =auth.getAuthorities().stream().map(GrantedAuthority::getAuthority).toList();
	            String token = jwt.generateToken(auth.getName(),roles);
	            ResponseCookie cookie = ResponseCookie.from("JWT-Token", token)
	                    .httpOnly(true)
	                    .secure(false)
	                    .path("/")
	                    .sameSite("Lax")
	                    .maxAge(Duration.ofMinutes(30))
	                    .build();
	            	response.addCookie(cookie);
	            	ObjectMapper mapper= new ObjectMapper();
	            	String result="";
	            	try {
	            		 Map<String, Object> person = new HashMap<>();
		            	 person.put("userId",auth.getName());
		            	 person.put("roles", roles);
		            	 
		            	 result =mapper.writeValueAsString(person);
		            	 log.info("mapper in string ::"+result);
	            	}catch (Exception e) {
	            		e.printStackTrace();
					}
	            	
	            	
	            	return Mono.just(ResponseEntity.ok(result));
	            	
	        } else {
	            return Mono.just(ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Authentication failed"));
	        }
	    }).onErrorResume(ex -> {
	        log.error("Authentication error", ex);
	        return Mono.just(ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Authentication failed"));
	    });	
	}
	
	@GetMapping("/logout")
	public Mono<Void> logout(ServerHttpResponse response){
		  ResponseCookie cookie = ResponseCookie.from("JWT-Token", "")
		            .httpOnly(true)
		            .secure(false)
		            .path("/")
		            .maxAge(0)
		            .build();
		        response.addCookie(cookie);
		        return Mono.empty();
		
	}
	
	@PostMapping("/verifyUserId")
	public Mono<String> verifyUser(@RequestBody String userId){
		log.info("userId :: {}",userId);
		return service.verifyUserId(userId);
	}

}
