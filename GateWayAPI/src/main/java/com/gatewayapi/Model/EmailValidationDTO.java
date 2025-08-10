package com.gatewayapi.Model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class EmailValidationDTO {
	
	private String userId;
	private String jwtTokenId;
	private int jwtValidIn;
	private int isValidated;
	

}
