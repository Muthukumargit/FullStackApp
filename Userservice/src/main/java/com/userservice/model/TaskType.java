package com.userservice.model;

import com.fasterxml.jackson.annotation.JsonAlias;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskType {	
	@JsonAlias("taskCode")
	private String type;
	@JsonAlias("taskType")
	private String typeDesc;
}
