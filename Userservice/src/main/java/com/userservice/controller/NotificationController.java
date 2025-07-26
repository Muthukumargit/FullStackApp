package com.userservice.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

import com.userservice.model.NotificationDTO;
import com.userservice.service.NotificationService;

import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Mono;

@Slf4j
@RestController
public class NotificationController {
	
	@Autowired
	private NotificationService notificationservice;
	
	@GetMapping("/getUserNotification")
	public Mono<List<NotificationDTO>> getUserNotification(@RequestHeader("X-Authenticated-User") String userId ){
		
		return notificationservice.getUserNotification(userId);
	
	}

}
