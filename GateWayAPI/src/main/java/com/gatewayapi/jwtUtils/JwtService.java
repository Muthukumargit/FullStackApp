package com.gatewayapi.jwtUtils;

import java.security.Key;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;

import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class JwtService {
	
	@Autowired
	private Environment env;
	
	private String secretKey;
	
	public JwtService() {
		
	}
	
	public String generateToken(String username,List<String> roles){
		
		Map<String, Object> claims= new HashMap<>();
		claims.put("roles", roles);
		
		return Jwts.builder()
				   .claims()
				   .add(claims)
				   .subject(username)
				   .issuedAt(new Date(System.currentTimeMillis()))
				   .expiration(new Date(System.currentTimeMillis() + 30 * 60 * 1000))
				   .and()
				   .signWith(getKey())
				   .compact();
				   
		
	}

	public SecretKey getKey() {
		byte[] keybytes= Decoders.BASE64.decode(env.getProperty("JWT.KEY"));
		return Keys.hmacShaKeyFor(keybytes);
	}

	public String extractUserName(String token) {		
		return extractClaim(token,Claims::getSubject);
	}

	private <T> T extractClaim(String token, Function<Claims, T> claimResolver) {
		final Claims claims=extractAllclaims(token);
		return claimResolver.apply(claims);
	}

	private Claims extractAllclaims(String token) {
		
		try {
			return Jwts.parser()
					   .verifyWith(getKey())
					   .build()
					   .parseSignedClaims(token)
					   .getPayload();
		} catch (ExpiredJwtException ex) {
			log.warn("Extracting expired token claims");
			throw ex; 
		}
	}

	public boolean validateToken(String token, UserDetails ud) {
		try {
			final String username=extractUserName(token);
		boolean isValid=(username.toUpperCase().equals(ud.getUsername().toUpperCase()) && !isTokenExpired(token));
		log.info("is valid Token :: "+isValid);
		return isValid;
			
		}catch (ExpiredJwtException ex) {
			log.warn("Token has expired: {}", ex.getMessage());
			return false;
		} catch (Exception e) {
			log.error("Token validation error: ", e);
			return false;
		}
		
	}

	private boolean isTokenExpired(String token) {
		return extractExpiration(token).before(new Date());
	}

	private Date extractExpiration(String token) {
		return extractClaim(token, Claims::getExpiration);
	}
}
