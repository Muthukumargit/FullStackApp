package com.userservice.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.userservice.dao.TaskDao;
import com.userservice.model.AddTask;
import com.userservice.model.EligibleUsersDto;
import com.userservice.model.TaskDetails;
import com.userservice.model.TaskRequest;
import com.userservice.model.TaskType;

import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Mono;

@Slf4j
@Service
public class TaskService {
	
	@Autowired
	private TaskDao taskDao;
	
	public Mono<List<TaskType>> getTaskTypes() {
		log.info("Fetching task types from TaskDao");
		return taskDao.getAllTaskTypes().doOnNext(taskTypes -> log.info("Fetched {} task types", taskTypes.size()))
				.doOnError(error -> log.error("Error fetching task types: {}", error.getMessage()));
	}
	
	public Mono<List<EligibleUsersDto>> getEligibleUsers(TaskRequest taskRequest){
		
		return taskDao.getEligibleUsers(taskRequest)
				.doOnNext(users -> log.info("Fetched {} eligible users for task type {}", users.size(), taskRequest))
				.doOnError(error -> log.error("Error fetching eligible users for task type {}: {}", taskRequest,
						error.getMessage()));
	}
	
	public Mono<String> createTask(String userId, AddTask taskRequest) {
		log.info("Creating task with request: {}", taskRequest);
		return taskDao.createTask(userId, taskRequest)
				.doOnSuccess(success -> log.info("Task created successfully for user: {}", userId))
				.doOnError(error -> log.error("Error creating task for user {}: {}", userId, error.getMessage()))
				.onErrorReturn(""); // Return false in case of error
	}
	
	public Mono<List<TaskDetails>> getAllTasks(){
		log.info("entered All Tasks ");
		return taskDao.getAllTasks();
	}
	
 	public Mono<List<TaskDetails>> getUserTasks(String userId){
 		return taskDao.getUserTasks(userId);
 	}
 	
 	public Mono<Boolean> updateTask(TaskDetails taskDetails,String userId) throws JsonProcessingException{
 		log.info("Entered UpdateTask");
 		log.info("Exit UpdateTask");
 		return taskDao.updateTask(taskDetails,userId);
 	}

}
