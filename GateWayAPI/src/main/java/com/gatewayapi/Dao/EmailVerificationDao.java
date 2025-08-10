package com.gatewayapi.Dao;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.gatewayapi.Model.EmailValidationDTO;

import lombok.extern.slf4j.Slf4j;


@Slf4j
@Repository
public class EmailVerificationDao {
	
	@Autowired
	private JdbcTemplate oracleJdbcTemplate;
	
	public String emailVerificationDetail(String userId,String token,String tokenId,String Expire) {
		System.out.println("userId :: "+userId+" Expire :: "+Expire);
		String sql="insert into email_auth_tokens (user_id,jwt_token,jwt_token_id,jwt_valid_in,expire_ts) values (?,?,?,1,TO_TIMESTAMP(?, 'YYYY-MM-DD HH24:MI:SS'))";
		int result =0;
		try {
			result =oracleJdbcTemplate.update(sql, userId,token,tokenId,Expire);
		}catch (Exception e) {
			e.printStackTrace();
			System.out.println("Error at email verification :: "+e.getMessage());
			return e.getMessage();
		}
		return result > 0 ? "Success":"Fail";
	}
	
	@Transactional
	public String verifyEmail(String userId,String tokenId) throws Exception {
		
		log.info("Entered into Email validation");
		log.info("userId :: {} tokenId :: {}",userId,tokenId);
		String sql="select user_id,jwt_token_id,jwt_valid_in,is_validated from email_auth_tokens where user_id = ? and jwt_token_id = ? and is_validated = 0 and jwt_valid_in=1";
		EmailValidationDTO email = new EmailValidationDTO();
		try {
			email= oracleJdbcTemplate.queryForObject(sql, new BeanPropertyRowMapper<>(EmailValidationDTO.class), userId,tokenId);
			if(email == null) {
				throw new Exception("Not a valid token");
			}
			int update=oracleJdbcTemplate.update("update email_auth_tokens set jwt_valid_in=0 , is_validated = 1 where user_id = ? and jwt_token_id = ?",userId,tokenId);
		if(update<=0) {
			throw new Exception("Failed to update...!");
		}
		else {
			int result = oracleJdbcTemplate.update("update app_users set email_verification_in=1 where user_id = ?",userId);
			if(result<=0) {
				throw new Exception("Failed to update...!");
			}
		}
		}catch (Exception e) {
			// TODO: handle exception
			e.printStackTrace();
			throw new Exception("Not a valid token");
		}
		
		log.info("Email validation :: {}",email);
		
		return "Email verification completed";
	}
	
	

}
