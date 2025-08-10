package com.gatewayapi.Dao;

import java.sql.Timestamp;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.SqlParameterSource;
import org.springframework.jdbc.core.simple.SimpleJdbcCall;
import org.springframework.stereotype.Repository;

import com.gatewayapi.Model.Users;
import com.gatewayapi.Model.userprofileDto;

import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

@Slf4j
@Repository
public class UserDao {

	
	@Autowired
	private JdbcTemplate oracleTemplate;
	
	public String userCount() {
		
		return oracleTemplate.queryForObject("select count(1) from testuser", String.class);
	}
	
	public Users getUserByUserId(String userName) {
		
		Object args[] = new Object[1];
		args[0]=userName;
		log.info("user name ::"+userName);
		String sql = "SELECT\n"+
				"    u.user_id,\n"+
				"    u.password,\n"+
				"    LISTAGG(ar.role_name, ',') WITHIN GROUP(\n"+
				"    ORDER BY\n"+
				"        ar.role_cd\n"+
				"    ) rolelist,\n"+
				"    u.email_verification_in\n"+
				"FROM\n"+
				"    app_users u,\n"+
				"    user_role ur,\n"+
				"    app_roles ar\n"+
				"WHERE\n"+
				"        u.user_id = ur.user_id\n"+
				"    AND ur.role_cd = ar.role_cd\n"+
				"    AND upper(u.user_id) = upper(?)\n"+
				"    AND u.active_in = 1\n"+
				"GROUP BY\n"+
				"    u.user_id,\n"+
				"    u.password,\n"+
				"    u.email_verification_in";
		
		
		Users user = oracleTemplate.queryForObject(sql, new BeanPropertyRowMapper<>(Users.class), args);
		return user;
	}
	
	public String register(userprofileDto userDetails) throws Exception {
		int user=0;
		String result="";
		
		SimpleJdbcCall procetureCall = new SimpleJdbcCall(oracleTemplate)
				.withCatalogName("USER_MANAGER_PKG")
				.withProcedureName("create_user");

		SqlParameterSource inParams = new MapSqlParameterSource()
				.addValue("p_user_id",userDetails.getUserId() )
				.addValue("p_first_name",userDetails.getFirstName())
				.addValue("p_last_name", userDetails.getLastName())
				.addValue("p_email", userDetails.getEmail())
				.addValue("p_password", userDetails.getPassword());
		
		Map<String, Object> output = procetureCall.execute(inParams);
				if(output.get("P_RESULT").toString().equalsIgnoreCase("SUCCESS") ) {
			result="User Registered Successfully...!";			
		}else{
			throw new Exception("Failed to add Users");
		}
		
		log.info("After insert ::"+user);
		return result;
	}
	
	public Mono<String> verifyUserId(String userId){
		log.info("Userid ::"+userId+"***************");
		return Mono.fromCallable(() ->{
			String sql="select case when EXISTS (select 1 from app_users where upper(user_id)= upper(?) ) then 'User Already Exisits' else 'User ID is availble' end as message from dual";
			return oracleTemplate.queryForObject(sql, String.class,userId);
		}).subscribeOn(Schedulers.boundedElastic())
				.doOnSuccess(restlt -> log.info("Result from db {}",restlt))
				.onErrorResume(e -> Mono.just(e.getMessage()));
		
		
	}
	
	public Mono<String> verifyEmail(String Email){
		log.info("Userid ::"+Email+"***************");
		return Mono.fromCallable(() ->{
			String sql="select case when EXISTS (select 1 from app_users where email= ? ) then 'Email Already Exisits' else 'Email is availble' end as message from dual";
			return oracleTemplate.queryForObject(sql, String.class,Email);
		}).subscribeOn(Schedulers.boundedElastic())
				.doOnSuccess(restlt -> log.info("Result from db {}",restlt))
				.onErrorResume(e -> Mono.just(e.getMessage()));
		
		
	}
	
	
	
}
