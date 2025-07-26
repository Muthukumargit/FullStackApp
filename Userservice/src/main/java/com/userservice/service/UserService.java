package com.userservice.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.userservice.dao.UserDao;
import com.userservice.model.RoleDetails;
import com.userservice.model.RoleTask;
import com.userservice.model.userprofileDto;

import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Mono;

@Slf4j
@Service
public class UserService {
	
	@Autowired
	private UserDao dao;
	
	public Mono<String> getMenus(String userId){
		
		return dao.getMenus(userId);
	}
	
	public Boolean checkAccess(String userId,String path){
		return dao.checkAccess(userId, path);
	}
	
	public Mono<userprofileDto> getUserProfile(String userId){
		return dao.getUserProfile(userId);
	}

	public void updateLastLoggedIn(String userId) {
		dao.updateLastLoggedIn(userId);
	}
	
	public Mono<String> changePushNotification(String userId,String status){
		
		
		log.info("status :: {} ",status);
		log.info("status change {}",status.equals("enable"));
		return dao.changePushNotification(userId, Integer.parseInt(status));
		
	}
	
	public Mono<List<RoleTask> > getRoleTaskList(){
		log.info("Entered into getRoleTaskList service");
		return dao.getRoleTaskList();
	}
	
	public Mono<String> updateRoleTaskTag(String userRole,String taggedTask){
		log.info("Entered into updateRoleTaskTag service");
		log.info("Exit into updateRoleTaskTag service");
		return dao.updateRoleTaskTag(userRole, taggedTask);
		
	}
	
	public Mono<List<userprofileDto>> getAllUsers(){
		return dao.getAllUsers();
	}
	
	public Mono<List<RoleDetails>> getAllRoles(){
		return dao.getAllRoles();
	}
	public Mono<String> updateUserRole(String userId,String roleList){
		return dao.updateUserRole(userId, roleList);		
	}

}
