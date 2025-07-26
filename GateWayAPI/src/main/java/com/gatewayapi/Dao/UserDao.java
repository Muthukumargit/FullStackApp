package com.gatewayapi.Dao;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
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
				"    U.password,\n"+
				"    LISTAGG(ar.role_name, ',') WITHIN GROUP(\n"+
				"    ORDER BY\n"+
				"        ar.role_cd\n"+
				"    ) roleList \n"+
				"FROM\n"+
				"    app_users u,\n"+
				"    user_role ur,\n"+
				"    app_roles ar\n"+
				"WHERE\n"+
				"        u.user_id = ur.user_id\n"+
				"    AND ur.role_cd = ar.role_cd\n"+
				"    AND upper(u.user_id) = upper(?) \n"+
				"    GROUP BY U.USER_ID,U.password";
		
		
		Users user = oracleTemplate.queryForObject(sql, new BeanPropertyRowMapper<>(Users.class), args);
		return user;
	}
	
	public String register(userprofileDto userDetails) {
		int user=0;
		user = oracleTemplate.update(
				"Insert into app_users (user_id,password,email,CREATED_DT,UPDATED_DT) values (?,?,?,current_timestamp,current_timestamp)",
				new Object[] { userDetails.getUserId(), userDetails.getPassword(),userDetails.getEmail() });
		int userProfile=0;
		if(user>0)
		{
			userProfile = oracleTemplate.update(
					"insert into user_profile (user_id,first_name,last_name,last_login_at,CREATE_ts,UPDATE_ts,email) values (?,?,?,null,current_timestamp,current_timestamp,?)",
					new Object[] { userDetails.getUserId(), userDetails.getFirstName(),userDetails.getLastName(),userDetails.getEmail() });
			oracleTemplate.update("insert into user_role (user_id,role_cd,CREATED_DT,UPDATED_DT) values (?,'U',current_timestamp,current_timestamp)",userDetails.getUserId());
			oracleTemplate.update("insert into user_role (user_id,role_cd,CREATED_DT,UPDATED_DT) values (?,'A',current_timestamp,current_timestamp)",userDetails.getUserId());
		}
		String result="";
		if(user>0 && userProfile >0 ) {
			result="User Registered Successfully...!";
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
	
}
