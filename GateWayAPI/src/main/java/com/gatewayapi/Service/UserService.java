package com.gatewayapi.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.ReactiveAuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.gatewayapi.Dao.UserDao;
import com.gatewayapi.Model.Users;
import com.gatewayapi.Model.userprofileDto;
import com.gatewayapi.jwtUtils.JwtService;

import reactor.core.publisher.Mono;

@Service
public class UserService {
	
	@Autowired
	private UserDao dao;
	
	
	

	
	private BCryptPasswordEncoder encoder= new BCryptPasswordEncoder(12);
	
	public String register(userprofileDto user) {
		user.setPassword(encoder.encode(user.getPassword()));
		return dao.register(user);
		
	}
	
	public Mono<String> verifyUserId(String userId){
		return dao.verifyUserId(userId);
	}
	

}
