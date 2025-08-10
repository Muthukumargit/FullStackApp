package com.gatewayapi.Model;

import java.util.Arrays;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Users {
	
	private int id;
	private String userId;
//	private String name;
//	private String email;
	private List<String> roles;
	private String password;
	private int emailVerificationIn;
	
	public void setRoleList(String roleList) {
		this.roles = Arrays.stream(roleList.split(","))
						   .map(String::trim)
						   .toList();
	}
	
	
}
