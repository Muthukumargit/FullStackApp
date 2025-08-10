package com.gatewayapi.Service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.sql.Timestamp;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Date;
import java.util.Locale;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.ReactiveAuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gatewayapi.Dao.UserDao;
import com.gatewayapi.Model.Users;
import com.gatewayapi.Model.userprofileDto;
import com.gatewayapi.jwtUtils.EmailJwtService;
import com.gatewayapi.jwtUtils.JwtService;

import jakarta.mail.MessagingException;
import reactor.core.publisher.Mono;

@Service
public class UserService {
	
	@Autowired
	private UserDao dao;
	
	@Autowired
	private EmailService email;
	
	@Autowired
	private EmailJwtService jwt;
	
	
	
	

	
	private BCryptPasswordEncoder encoder= new BCryptPasswordEncoder(12);
	
	@Transactional
	public String register(userprofileDto user) throws Exception {
		user.setPassword(encoder.encode(user.getPassword()));
		
		Map<String, Object> token= jwt.generateTokenForEmail(user.getEmail(), user.getUserId());
		System.out.println("token :: "+token.toString());		
		String result = dao.register(user);
		
		if(result.equalsIgnoreCase("User Registered Successfully...!")) {
			try {
				DateTimeFormatter inputFormatter = DateTimeFormatter.ofPattern("EEE MMM dd HH:mm:ss z yyyy", Locale.ENGLISH);
				DateTimeFormatter outputFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
				ZonedDateTime zonedDateTime = ZonedDateTime.parse(token.get("expire").toString(), inputFormatter);
				String formatted = outputFormatter.format(zonedDateTime);
				email.emailVerificationDetail(user,token,formatted);
			} catch (MessagingException e) {
				e.printStackTrace();
			}
			return result;
		}else {
			return result;
		}
		
	}
	
	public Mono<String> verifyUserId(String userId){
		return dao.verifyUserId(userId);
	}
	public Mono<String> verifyEmail(String Email){
		return dao.verifyEmail(Email);
	}
	

}
