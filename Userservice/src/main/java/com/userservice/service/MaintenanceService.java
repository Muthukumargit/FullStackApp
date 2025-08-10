package com.userservice.service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collector;
import java.util.stream.Collectors;

import javax.management.relation.Role;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.userservice.dao.MaintenanceDao;
import com.userservice.model.RoleDetails;
import com.userservice.model.RoleUserMapDTO;

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
	public Mono<List<RoleUserMapDTO>> getAllRolesWithUserIds(){
		log.info("Entered into getAllRolesWithUserIds ");
		log.info("Exit From getAllRolesWithUserIds ");
		return dao.getAllRolesWithUserIds();
	}
	public Mono<String> deleteSelectedRoles(String RoleList){
		List<String> cleanedList= Arrays.stream(RoleList.split(",")).map(String::trim).toList();
//		List<String> deleteList = Arrays.asList(RoleList.split(","));
		return dao.deleteSelectedRoles(RoleList);
	}
}
