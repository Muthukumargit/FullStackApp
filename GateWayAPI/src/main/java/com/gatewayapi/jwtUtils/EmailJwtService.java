package com.gatewayapi.jwtUtils;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.function.Function;
import java.util.stream.Collectors;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import com.cipher.CipherUtils;
import com.gatewayapi.Service.EmailService;
import com.gatewayapi.config.DataBaseConfig;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class EmailJwtService {

    private final DataBaseConfig dataBaseConfig;

	@Autowired
	private Environment env;
	
	@Autowired
	private CipherUtils cipher;
	
	@Autowired
	private EmailService emailService;


    EmailJwtService(DataBaseConfig dataBaseConfig) {
        this.dataBaseConfig = dataBaseConfig;
    }
	
	
	public SecretKey getEmailKey() {
		byte[] keybytes= Decoders.BASE64.decode(env.getProperty("email.jwt.secret"));
		return Keys.hmacShaKeyFor(keybytes);
	}
	
	public String extractUserId(String token) {		
		return extractClaim(token,Claims::getSubject);
	}
	public String extractTokenId(String token) {		
		return extractClaim(token,Claims -> Claims.get("tokenId",String.class));
	}
	private <T> T extractClaim(String token, Function<Claims, T> claimResolver) {
		final Claims claims=extractEmailAllclaims(token);
		return claimResolver.apply(claims);
	}

	private Claims extractEmailAllclaims(String token) {
		
		try {
			return Jwts.parser()
					   .verifyWith(getEmailKey())
					   .build()
					   .parseSignedClaims(token)
					   .getPayload();
		} catch (ExpiredJwtException ex) {
			log.warn("Extracting expired token claims");
			throw ex; 
		}
	}

	public boolean validateEmailToken(String token) throws Exception {
		try {
			
			String plainToken=cipher.DecryptionForEmail(token);
			
			if(!isTokenExpired(plainToken)) {
			System.out.println("userId :: "+extractUserId(plainToken)+" Token id :: "+extractTokenId(plainToken));
			final String userId=cipher.DecryptionForEmail(extractUserId(plainToken));
			final String tokenId=cipher.DecryptionForEmail(extractTokenId(plainToken));
			if(userId !=null && !userId.isEmpty() && !userId.isBlank() && tokenId!=null && !tokenId.isEmpty() && !tokenId.isBlank()) {
				try {
				emailService.verifyEmail(userId, tokenId);
				}catch(Exception e) {
					e.printStackTrace();
					if(e.getMessage().equalsIgnoreCase("Not a valid token")) {
						throw new Exception(e.getMessage());
					}
				}
				return true;
			}
			else {
				throw new Exception("Invalid token");
			}
			}
			else {
				return false;
			}
			
		}catch (ExpiredJwtException ex) {
			log.warn("Token has expired: {}", ex.getMessage());
			throw new Exception(ex.getMessage());
		} catch (Exception e) {
			log.error("Token validation error: ", e);
			throw new Exception(e.getMessage());
		}
		
	}

	private boolean isTokenExpired(String token) {
		return extractExpiration(token).before(new Date());
	}

	private Date extractExpiration(String token) {
		return extractClaim(token, Claims::getExpiration);
	}
	
	
	public Map<String, Object> generateTokenForEmail(String email,String userId) {
		Map<String,Object> result = new HashMap<>();
		String plainTokenId= generateRandomString(userId);
		String encyptedJwtId = cipher.EncryptionForEmail(plainTokenId);
		Map<String, Object> claims= new HashMap<>();
		claims.put("tokenId", encyptedJwtId);
		Date issueAt= new Date(System.currentTimeMillis());
		Date expire=new Date(System.currentTimeMillis() + 24 * 60 * 60 * 1000);
		System.out.println("issueAt :: "+issueAt+" Expire :: "+expire );
		String token= Jwts.builder()
				   .claims()
				   .add(claims)
				   .subject(cipher.EncryptionForEmail(userId))
				   .issuedAt(new Date(System.currentTimeMillis()))
				   .expiration(new Date(System.currentTimeMillis() + 24 * 60 * 60 * 1000))
				   .and()
				   .signWith(getEmailKey())
				   .compact();
		result.put("token", cipher.EncryptionForEmail(token));
		result.put("plainToken", token);
		result.put("plainTokenId", plainTokenId);
		result.put("expire", expire);
		System.out.println("Plain Token :: "+token);
		return result;
	}
	

	

	
	public String generateRandomString (String userId) {
		String characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
		
		String generatedId= new Random()
						.ints(10, 0, characters.length())
						.mapToObj(i -> String.valueOf(characters.charAt(i)))
						.collect(Collectors.joining());
		return String.join("-", userId, generatedId);
	}
	

	
}
