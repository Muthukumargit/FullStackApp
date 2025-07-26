package com.userservice.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/userservice")
public class TestController {

	@RequestMapping("/test")
	public String test() {
		System.out.println("testt skfjaskfnkijdf");
		return "user Service Test";
	}
}
