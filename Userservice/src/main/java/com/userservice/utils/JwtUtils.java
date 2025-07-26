package com.userservice.utils;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

@Component
public class JwtUtils {
	@Autowired
	private Environment env;
	
	private String secretKey;

}
