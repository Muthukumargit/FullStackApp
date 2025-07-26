package com.userservice.model;

import java.text.SimpleDateFormat;
import java.util.Date;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddTask {
	
	private String id;
	private String taskName;
	private String taskDescription;
	private String taskFeedback;
	private String taskType;
	private String assignedToUserId;
	private String assignedByUserId;
	private String status;
	private String priority;
	private String dueDate;
	private String createdBy;
	private String createdDate;
	private String updatedBy;
	private String updatedDate;
	
}
