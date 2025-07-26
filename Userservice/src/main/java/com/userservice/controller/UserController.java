package com.userservice.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;

import com.userservice.model.RoleDetails;
import com.userservice.model.RoleTask;
import com.userservice.model.userprofileDto;
import com.userservice.service.UserService;
import com.userservice.utils.UserDetailsUtil;

import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

@Slf4j
@RestController
public class UserController {

	@Autowired
	private UserService service;
	
	@GetMapping("/headers")
	public Mono<String> getHeaders(@RequestHeader("X-Authenticated-User") String userId) {
		
		log.info("inside User Service");
		
		return service.getMenus(userId);
	}
	
	@GetMapping("/haveAccess/{path}")
	public Mono<ResponseEntity<?>> checkAccess(@RequestHeader("X-Authenticated-User") String userId,@PathVariable String path){
		log.info("User Id {}",userId);
		log.info("path {}",path);
		boolean isValid=service.checkAccess(userId, path);
		if(isValid)
			return Mono.just(ResponseEntity.ok("user have access"));
		
		return Mono.just(ResponseEntity.status(HttpStatus.NOT_ACCEPTABLE).build());
	}
	
	@GetMapping("/getProfile")
	public Mono<userprofileDto> getUserProfile(@RequestHeader("X-Authenticated-User") String userId){
		return service.getUserProfile(userId);
	}
	@GetMapping("/updateLastLoggedIn")
	public void updateLastLoggedIn(@RequestHeader("X-Authenticated-User") String userId) {
		service.updateLastLoggedIn(userId);
	}
	
	@PostMapping("/enablePushNotification")
	public Mono<ResponseEntity<String>> changePushNotification(@RequestHeader("X-Authenticated-User") String userId,@RequestBody String status){
		log.info("Status :: {}",status);
			return service.changePushNotification(userId, status).map(result ->{
				return ResponseEntity.ok().body(result);
			})
			.doOnSuccess(result -> log.info("status :: {}",result));		
	}
	
	@GetMapping("/getRoleTaskList")
	public Mono<List<RoleTask>> getRoleTaskList(){
		log.info("Entered into getRoleTaskList controller");
		log.info("Exit into getRoleTaskList controller");
		return service.getRoleTaskList();
		
	}
	
	@PostMapping("/updateRoleTaskTag")
	public Mono<String> updateRoleTaskTag(@RequestBody Map<String, Object> body) {
		String userRole= (String) body.get("userRole");
		String taggedTask= (String) body.get("taggedTask");
		log.info("userRole :: {}  TaskList :: {} ",userRole,taggedTask);
		return service.updateRoleTaskTag(userRole, taggedTask);
	}
	
	@GetMapping("/getAllUsers")
	public Mono<List<userprofileDto>> getAllUsers(){
		
		return service.getAllUsers();
	}
	@GetMapping("/getAllRoles")
	public Mono<List<RoleDetails>> getAllRoles(){
		
		return service.getAllRoles();
	}
	@PostMapping("/updateRole")
	public Mono<String> updateRole(@RequestBody Map<String, Object> body){
		String userId=(String) body.get("userId");
		String roleList=(String) body.get("roleList");
		log.info("Entered into Update Role");
		log.info("userId {} roleList {}",body.get("userId"),body.get("roleList"));
		return service.updateUserRole(userId, roleList);
	}
}
