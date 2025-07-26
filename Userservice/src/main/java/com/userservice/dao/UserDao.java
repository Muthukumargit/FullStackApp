package com.userservice.dao;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.SqlParameterSource;
import org.springframework.jdbc.core.simple.SimpleJdbcCall;
import org.springframework.stereotype.Repository;

import com.userservice.model.RoleDetails;
import com.userservice.model.RoleTask;
import com.userservice.model.TaskType;
import com.userservice.model.userprofileDto;

import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Scheduler;
import reactor.core.scheduler.Schedulers;

@Slf4j
@Repository
public class UserDao {

	@Autowired
	private JdbcTemplate oracleJdbcTemplate;
	
	
//	public 
	
	public Mono<String> getMenus(String userId){
		String menus="";
		
		menus= oracleJdbcTemplate.queryForObject("select LISTAGG (DISTINCT am.name,',' ) WITHIN GROUP (ORDER BY am.id) as menus from user_role ur, roles_menu rm, app_menus am where ur.role_cd=rm.role_cd and rm.menu_id=am.id and upper(ur.user_id)=upper(?)",String.class,userId);
		
		return Mono.just(menus);
		
	}
	
	public Boolean checkAccess(String userId,String path){
		
		String sql ="select count(1) from user_role ur,roles_menu rm, app_menus am where ur.role_cd=rm.role_cd and rm.menu_id=am.id and upper(ur.user_id)=upper(?) and am.name= ?";
		
		int count = oracleJdbcTemplate.queryForObject(sql, Integer.class, userId,path);
		return count >0;
	}
	
	public Mono<userprofileDto> getUserProfile(String userId){
		
		String sql ="select up.user_id,up.first_name,up.last_name,up.phone_number,up.last_login_at as lastLoggedIn,up.push_notification, LISTAGG(ar.role_name ,' ,') WITHIN GROUP(ORDER by ar.role_cd) as roles from user_profile up, user_role ur, app_roles ar where upper(up.user_id) = upper(?) and up.user_id=ur.user_id\r\n"
				+ "and ur.role_cd=ar.role_cd GROUP by up.user_id,up.first_name,up.last_name,up.phone_number,up.last_login_at,up.push_notification ";
		return Mono.fromCallable(() ->
		oracleJdbcTemplate.queryForObject(sql, new BeanPropertyRowMapper<>(userprofileDto.class), userId)
				).subscribeOn(Schedulers.boundedElastic())
				.doOnNext(profile -> log.info("Fetched profile : {} ",profile))
				.onErrorResume(Exception.class, ex ->{
					log.warn("Exception on profile Load {}",ex);
					ex.printStackTrace();
					return Mono.empty();
				});
		
	}
	
	public void updateLastLoggedIn(String userId) {
		String sql="update user_profile set last_login_at= current_timestamp where upper(user_id)=upper(?)";
		oracleJdbcTemplate.update(sql, userId);
	}
	
	public Mono<String> changePushNotification(String userId,int status) {
		
		log.info("status in dao :: {} ",status);
		
		return Mono.fromCallable(() ->{
			
			String sql="update user_profile set push_notification = ? where user_id=?";
			
			int update = oracleJdbcTemplate.update(sql,status,userId);
			
			return update>0? status==1 ? "Notification Enabled":"Notification Disabled" : "Failed to change the Notification Status";
			
		}).subscribeOn(Schedulers.boundedElastic())
				.doOnSuccess(result -> log.info("result :: {}",result))
				.doOnError(e-> log.error("error :: {}",e));
		
	}
	
	public Mono<List<RoleTask> > getRoleTaskList(){
		log.info("Entered into getRoleTaskList DAO method...");
		
		String sql="SELECT ar.role_cd, ar.role_name, LISTAGG(rt.task_type_cd, ', ') WITHIN GROUP(ORDER BY rt.role_cd) AS tasklist FROM app_roles ar LEFT JOIN role_task_type_map rt ON ar.role_cd = rt.role_cd GROUP BY ar.role_cd, ar.role_name";
		return Mono.fromCallable(() ->{
			return oracleJdbcTemplate.query(sql, new BeanPropertyRowMapper<>(RoleTask.class));
			
		}).subscribeOn(Schedulers.boundedElastic())
				.doOnSuccess(result -> log.info("result :: {}",result))
				.doOnError(e -> log.error("error :: {} ",e));
	}
	
	public Mono<String> updateRoleTaskTag(String userRole,String taggedTask){
		log.info("Entered into updateRoleTaskTag .... role {}  list {}",userRole,taggedTask);
		return Mono.fromCallable(() ->{
			SimpleJdbcCall procedurecall= new SimpleJdbcCall(oracleJdbcTemplate)
					.withCatalogName("USER_MANAGER_PKG")
					.withProcedureName("UPDATE_ROLE_TASK");
			SqlParameterSource inParams = new MapSqlParameterSource()
											.addValue("p_role_cd", userRole)
											.addValue("p_task_list", taggedTask);
			Map<String, Object> result= procedurecall.execute(inParams);
			log.info("Result from procedure execution: {}", result);
			log.info("result from Procedure :: {} ",result.get("p_result"));
			return (String) result.get("P_RESULT");
		}).subscribeOn(Schedulers.boundedElastic())
				.doOnSuccess(result -> {log.info("Result from procedure :: {}",result);log.info("Exit from updateRoleTaskTag ...");})
				.doOnError(e -> log.error("error :: {} ",e));
		
	}
	
	public Mono<List<userprofileDto>> getAllUsers(){
		return Mono.fromCallable(() ->{
			
			String sql = "select up.user_id,up.first_name,up.last_name,up.last_login_at as lastLoggedIn,up.phone_number as phone,up.email,ListAgg(ar.role_name,',') WITHIN group(order by ar.role_cd)  as roles\n"+
					"from user_profile up left join user_role ur on up.user_id=ur.user_id left join app_roles ar on ar.role_cd=ur.role_cd GROUP BY up.user_id,up.first_name,up.last_name,up.last_login_at,up.phone_number,up.email";

			return oracleJdbcTemplate.query(sql, new BeanPropertyRowMapper<>(userprofileDto.class));
//			return null;
		}).subscribeOn(Schedulers.boundedElastic())
				.doOnSuccess(result -> log.info("result of get all users :: {}",result))
				.doOnError(e -> log.error("Error from get all users {} ",e));
	}
	
	public Mono<List<RoleDetails>> getAllRoles(){
		
		return Mono.fromCallable(() ->{
			return oracleJdbcTemplate.query("select role_cd,role_name from app_roles", new BeanPropertyRowMapper<>(RoleDetails.class));
			
		}).subscribeOn(Schedulers.boundedElastic())
				.doOnSubscribe(result -> log.info("Fetched Role Count :: {}",result.toString()))
				.doOnError(e -> log.error("Error :: {}",e));
	}
	
	public Mono<String> updateUserRole(String userId,String roleList){
		
		return Mono.fromCallable(() ->{
			SimpleJdbcCall procedure=new SimpleJdbcCall(oracleJdbcTemplate).withCatalogName("user_manager_pkg").withProcedureName("update_user_role");
			MapSqlParameterSource inParams = new MapSqlParameterSource().addValue("p_user_id", userId).addValue("p_role_list", roleList);
			Map<String, Object> result = procedure.execute(inParams);
			return (String) result.get("P_RESULT");
		}).subscribeOn(Schedulers.boundedElastic())
				.doOnSuccess(result -> log.info("Role update :: {}",result))
				.doOnError(e -> log.error("Exception while Updating the Role :: {}",e.getMessage()));
		
	}
}
