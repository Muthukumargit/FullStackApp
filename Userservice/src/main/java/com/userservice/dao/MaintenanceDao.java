package com.userservice.dao;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import com.userservice.model.RoleDetails;
import com.userservice.model.RoleUserMapDTO;

import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

@Slf4j
@Repository
public class MaintenanceDao {
	
	@Autowired
	private JdbcTemplate oracleJdbcTemplate;
	
	public Mono<String> checkRoleCd(String roleCd){
		return Mono.fromCallable(() -> {
			int count = oracleJdbcTemplate.queryForObject("select count (1) from app_roles where role_cd=?", Integer.class, roleCd);
			return count > 0 ? "NotValid" :"Valid";
		}).subscribeOn(Schedulers.boundedElastic())
				.doOnSuccess(result -> log.info("Role code available :: {} ",result))
				.doOnError(e-> log.error("Exception on checking the role :: {}",e));
	}

	public Mono<String> addRole(RoleDetails roleDetails){
		return Mono.fromCallable(() ->{
			int count= oracleJdbcTemplate.update("insert into app_roles (role_cd,role_name) values(?,?)", roleDetails.getRoleCd(),roleDetails.getRoleName());
			return count > 0 ? "Role Added":"Failed to Add Role";
		}).subscribeOn(Schedulers.boundedElastic());
	}
	
	public Mono<List<RoleUserMapDTO>> getAllRolesWithUserIds(){
		
		return Mono.fromCallable(() ->{
			String sql="SELECT ar.role_cd,ar.role_name,LISTAGG(ur.user_id, ', ') WITHIN GROUP(ORDER BY ur.user_id) AS user_ids FROM app_roles ar LEFT JOIN user_role ur ON ar.role_cd = ur.role_cd GROUP BY ar.role_cd, ar.role_name";
			return oracleJdbcTemplate.query(sql, new BeanPropertyRowMapper<>(RoleUserMapDTO.class));
		}).subscribeOn(Schedulers.boundedElastic())
				.doOnSuccess(result -> log.info("Successfully retrived RoleUsers {}",result))
				.doOnError(e -> log.error("Error while retriving the RoleUser {}",e.getMessage()));
		
	}
	
	public Mono<String> deleteSelectedRoles(String Roles){
		
		return Mono.fromCallable(() ->{
			String placeHolder= String.join(",", Collections.nCopies(Roles.split(",").length, "?"));
			String sql="delete from app_roles where role_cd in ("+placeHolder+")";	
			log.info("SQL ::{}",sql);
			log.info("Params :: {}",Roles);
			Object[] args = new Object[Roles.split(",").length];
			for(int i=0;i<Roles.split(",").length;i++) {
				args[i]=Roles.charAt(i);
			}
			args= Roles.split(",");
			log.info("args :: {}",args);
			int result=0;
			try {
				result=oracleJdbcTemplate.update(sql,args);
				log.info("Result :: {}",result);
			}catch (Exception e) {
				// TODO: handle exception
				e.printStackTrace();
				log.error("error :: {}",e.getMessage());
			}
			return result>0 ? "Deleted Successfully":"Issue in delete Role";			
		}).subscribeOn(Schedulers.boundedElastic());
		
		
	}
}
