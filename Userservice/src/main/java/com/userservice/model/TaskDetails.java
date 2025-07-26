package com.userservice.model;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Builder.Default;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
public class TaskDetails {	
	private String ticketId;
	private String taskName;
	private String taskDescription;
	private String taskFeedback;
	private TaskFeedback taskFeedbackJson;
	@Default	
	private List<TaskFeedback> taskFeedbackList;
	@Default
	private TaskType taskType;
	private String taskCode;
	@Default
	private AssingedTo assignedTo;
	@Default
	private AssingedBy assignedBy;
	@Default
	private TaskStatus status;
	private String priority;
	private String dueDate;
	private String createdBy;
	private String createdDate;
	private String updatedBy;
	private String updatedDate;	
	
	public void setDueDate(Date dueDate) {
		SimpleDateFormat sdf = new SimpleDateFormat("dd-MM-yyyy");
		this.dueDate = sdf.format(dueDate);
	}

}
