package com.userservice.model;

import java.sql.Timestamp;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TaskFeedback {
	
	private String feedback;
	private String feedbackBy;
	private String feedbackAt;
	private String status;

}
