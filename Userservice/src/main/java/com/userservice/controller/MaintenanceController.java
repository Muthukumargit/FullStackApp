package com.userservice.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.userservice.model.RoleDetails;
import com.userservice.service.MaintenanceService;

import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Mono;

@Slf4j
@RestController
public class MaintenanceController {
	
	@Autowired
	private MaintenanceService service;
	
	@PostMapping("/checkRoleCd")
	public Mono<ResponseEntity<String>> checkRoleCd(@RequestBody String roleCd){
		log.info("Inside MaintenanceController");
		log.info("Checking Role Code :: {}",roleCd);
		
		return service.checkRoleCd(roleCd)
                .map(result -> {
                	if(result.equalsIgnoreCase("NotValid")) {
                		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(result);
                	}else {
                		return ResponseEntity.status(HttpStatus.OK).body(result);
                	}})
                .doOnError(e -> log.error("Error checking role code {}", e));
	}
	@PostMapping("/addRole")
	public Mono<ResponseEntity<String>> addRole(@RequestBody RoleDetails roleDetails){
		
		log.info("Add Role :: {}",roleDetails.toString());
		
		return service.addRole(roleDetails)
						.map(result -> {
							if(result.equalsIgnoreCase("Role Added")) {
								return ResponseEntity.status(HttpStatus.OK).body(result);
							}else {
								return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(result);
							}
						}).doOnError(e -> log.error("Error while adding Role {}",e));
	}

}
