package com.userservice.model;



import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RoleUserMapDTO {
	
	private String roleCd;
	private String roleName;
	private List<String> userIds;

}
