package com.userservice.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.userservice.model.AddTask;
import com.userservice.model.AssingedBy;
import com.userservice.model.EligibleUsersDto;
import com.userservice.model.TaskDetails;
import com.userservice.model.TaskRequest;
import com.userservice.model.TaskType;
import com.userservice.service.TaskService;

import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Mono;

@Slf4j
@RestController
public class TaskController {
	
	@Autowired
	private TaskService taskService;
	
	@GetMapping("/allTasksType")
	public Mono<List<TaskType>> getTaskTypes() {
		taskService.getAllTasks();
		return taskService.getTaskTypes()
				.doOnNext(taskTypes -> System.out.println("Fetched " + taskTypes.size() + " task types"))
				.doOnError(error -> System.err.println("Error fetching task types: " + error.getMessage()));
		
	}
	
	@PostMapping("/eligibleUsers")
	public Mono<List<EligibleUsersDto>> getEligibleUsers(@RequestBody TaskRequest taskRequest) {
		log.info("Fetching eligible users for task type in controller : {}", taskRequest);

		return taskService.getEligibleUsers(taskRequest)
				.doOnNext(users -> System.out
						.println("Fetched " + users.size() + " eligible users for task type " + taskRequest+"users "+ users.toString()))
				.doOnError(error -> System.err.println(
						"Error fetching eligible users for task type " + taskRequest + ": " + error.getMessage()));
	}
	
	@PostMapping("/createTask")
	public Mono<ResponseEntity<String>> createTask(@RequestHeader("X-Authenticated-User") String userId, @RequestBody AddTask taskDetails) {
	 
			taskDetails.setCreatedBy(userId); 
			taskDetails.setUpdatedBy(userId); 
			taskDetails.setAssignedByUserId(userId);
			taskDetails.setStatus("N"); 
			log.info("input taskDetails: {}", taskDetails);
		return taskService.createTask(userId, taskDetails).map(result -> {
			if (!result.equalsIgnoreCase("")) {
				log.info("Task created successfully for user: {}", userId);
				return ResponseEntity.ok("Task "+result+" Created Successfully");
			} else {
				log.error("Failed to create task for user: {}", userId);
				return ResponseEntity.status(500).body("Failed to create task");
			}
		})
				.doOnError(error -> log.error("Error creating task for user {}: {}", userId, error.getMessage()));
	}
	
	@GetMapping("/getAllTasks")
	public Mono<List<TaskDetails>> getAllTasks(){
		log.info("inside Get All Tasks");
		return taskService.getAllTasks();
	}
	
	@GetMapping("/getUserTasks")
	public Mono<List<TaskDetails>> getUserTasks(@RequestHeader("X-Authenticated-User") String userId){
		
		return taskService.getUserTasks(userId);
		
	}
	
	@PostMapping("/updateTask")
	public Mono<ResponseEntity<?>> updateTasks(@RequestHeader("X-Authenticated-User") String userId, @RequestBody TaskDetails taskDetails) throws JsonProcessingException {
		
		taskDetails.setUpdatedBy(userId);
		taskDetails.setAssignedBy(new AssingedBy(userId, userId));
		log.info("task Details :: {}",taskDetails);
		
		return taskService.updateTask(taskDetails,userId).map(success ->{
			if(success) {
				return ResponseEntity.ok("Task Updated successfully");
			}else {
				return ResponseEntity.status(500).body("Failed to update the task");
			}
		});
	}
	
}
