package com.userservice.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.userservice.dao.MaintenanceDao;
import com.userservice.model.RoleDetails;

import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Mono;

@Slf4j
@Service
public class MaintenanceService {

	@Autowired
	private MaintenanceDao dao;
	
	public Mono<String> checkRoleCd(String roleCd){
		log.info("Entered into MaintenanceService ");
		return dao.checkRoleCd(roleCd);
	}
	
	public Mono<String> addRole(RoleDetails roleDetails){
		log.info("Entered into addRole ");
		return dao.addRole(roleDetails);
	}

}
