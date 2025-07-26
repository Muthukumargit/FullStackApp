package com.userservice.dao;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import com.userservice.model.RoleDetails;

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
}
