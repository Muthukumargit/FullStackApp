package com.gatewayapi.Model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class userprofileDto {
	
	private String userId;
	private String firstName;
	private String lastName;
	private String lastLoggedIn;
	private Long phone;
	private String roles;
	private String email;
	private String password;
}
