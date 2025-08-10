package com.gatewayapi.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.gatewayapi.Dao.EmailVerificationDao;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
public class EmailVerificationController {
	
	@Autowired
	private EmailVerificationDao dao;

	@GetMapping("/emailVerification")
	public void emailVerification(@RequestParam String verificationToken) {
		
		log.info("Token from verification :: {}",verificationToken);
		
		
	}
	
}
