package com.gatewayapi.Model;

import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class Student {
	
	private int id;
	private String name;
	private int mark;

}
