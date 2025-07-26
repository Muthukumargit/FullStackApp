package com.userservice.model;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TaskRequest {
	private String taskType;
    private boolean addAdminUsers;

}
