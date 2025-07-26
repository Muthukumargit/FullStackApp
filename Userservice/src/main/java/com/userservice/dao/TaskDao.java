package com.userservice.dao;


import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.util.Date;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.userservice.model.AddTask;
import com.userservice.model.AssingedBy;
import com.userservice.model.AssingedTo;
import com.userservice.model.EligibleUsersDto;
import com.userservice.model.TaskDetails;
import com.userservice.model.TaskFeedback;
import com.userservice.model.TaskRequest;
import com.userservice.model.TaskStatus;
import com.userservice.model.TaskType;

import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

@Slf4j
@Repository
public class TaskDao {
	
	@Autowired
	private JdbcTemplate oracleJdbcTemplate;
	
	@Autowired
	private NotificationDao notificaion;
	
		String sql = "select task_type_cd as type ,task_type_desc as typeDesc from task_type"; // Adjust the SQL query as per your database schema
		public Mono<List<TaskType>> getAllTaskTypes() {

		List<TaskType> taskTypes = oracleJdbcTemplate.query(sql, new BeanPropertyRowMapper<>(TaskType.class));
		
		log.info("Retrieved task types: {}", taskTypes);
		log.info("Number of task types retrieved: {}", taskTypes.size());
		

		return Mono.just(taskTypes);
	}
	
	public Mono<List<EligibleUsersDto>> getEligibleUsers(TaskRequest taskRequest) {
		String sql = "SELECT\n"+
				"    up.first_name\n"+
				"    || ', '\n"+
				"    || up.last_name AS username,\n"+
				"    up.user_id,\n"+
				"    ar.role_name as userrole\n"+
				"FROM\n"+
				"    role_task_type_map rm,\n"+
				"    user_role          ur,\n"+
				"    user_profile       up,\n"+
				"    app_roles          ar\n"+
				"WHERE\n"+
				"        rm.task_type_cd = ? \n"+
				"    AND ar.role_cd = ur.role_cd\n"+
				"    AND rm.role_cd = ur.role_cd\n"+
				"    AND ur.user_id = up.user_id\n";
		if (!taskRequest.isAddAdminUsers()) {
			sql += " and rm.role_cd !='A'";
		} 
		
		log.info("final sql query for eligible users: {}", sql);
		List<EligibleUsersDto> eligibleUsers = oracleJdbcTemplate.query(sql,
				new BeanPropertyRowMapper<>(EligibleUsersDto.class),taskRequest.getTaskType() );

		log.info("Retrieved eligible users for task type {}: {}", taskRequest, eligibleUsers);
		log.info("Number of eligible users retrieved: {}", eligibleUsers.size());

		return Mono.just(eligibleUsers);
	}
	
	
	public Mono<String> createTask(String userId, AddTask taskRequest) {
		log.info("Creating task for user {} with request: {}", userId, taskRequest);
		
		String sql= "INSERT INTO tasks (task_name,task_desc,task_type_cd,assigned_by,assigned_to,created_by,due_date,status_cd) values (?,?,?,?,?,?,TO_DATE(?, 'YYYY-MM-DD'),?)";
		
		KeyHolder keys= new GeneratedKeyHolder();
		log.info("Task Due Date ::"+java.sql.Date.valueOf(taskRequest.getDueDate()).toString());
		int result = oracleJdbcTemplate.update(connection ->{
			PreparedStatement ps = connection.prepareStatement(sql,new String[] {"ticket_id"});
			ps.setString(1,taskRequest.getTaskName());
			ps.setString(2,taskRequest.getTaskDescription());
			ps.setString(3,taskRequest.getTaskType());
			ps.setString(4,taskRequest.getAssignedByUserId());
			ps.setString(5,taskRequest.getAssignedToUserId());
			ps.setString(6,taskRequest.getCreatedBy());
			ps.setString(7, java.sql.Date.valueOf(taskRequest.getDueDate()).toString());
			
			ps.setString(8,taskRequest.getStatus());
			return ps;
		}, keys);
		String key=keys.getKeyAs(String.class);
		log.info("Generated Key :: {}",key);
		notificaion.createNotification(key, taskRequest.getAssignedToUserId(), "Task has been created/assigned to YOU...!");
		return Mono.just(key);
	}
	
	public Mono<List<TaskDetails>> getAllTasks(){
		
		log.info("entered All Tasks ");
		
		
		String sql = "SELECT\n"+
				"				    t.TICKET_ID,\n"+
				"				    t.task_name,\n"+
				"				    t.task_desc,\n"+
				"                    t.task_type_cd,\n"+
				"				    t.task_feedback,\n"+
				"				    tt.task_type_desc,\n"+
				"                    up.user_id touserid,\n"+
				"				    up.first_name|| ', '|| up.last_name as tousername,\n"+
				"                    up1.user_id as byuserId,\n"+
				"				    up1.first_name|| ', '|| up1.last_name as byusername,\n"+
				"				    t.created_by,\n"+
				"				    to_char(t.created_ts, 'DD-MON-YYYY hh:mm:ss AM') AS created_ts,\n"+
				"				    to_char(t.updated_ts, 'DD-MON-YYYY hh:mm:ss AM') AS updated_ts,\n"+
				"				    ts.status,\n"+
				"                    ts.status_cd,\n"+
				"				    to_char(t.due_date, 'DD-MON-YYYY')               AS due_date\n"+
				"				FROM\n"+
				"				    tasks t,\n"+
				"				    task_type tt,\n"+
				"				    user_profile up,\n"+
				"				    user_profile up1,\n"+
				"				    task_status ts    \n"+
				"				    where t.task_type_cd=tt.task_type_cd and\n"+
				"				    t.assigned_to=up.user_id\n"+
				"				    and t.assigned_by=up1.user_id\n"+
				"				    and ts.status_cd=t.status_cd\n"+
				"				    \n"+
				"				ORDER BY\n"+
				"				    updated_ts DESC";
		return Mono.fromCallable(() ->{			
		 return oracleJdbcTemplate.query(sql,new TaskDetailsRowMapper());
		}).subscribeOn(Schedulers.boundedElastic())
				.doOnSuccess(tasks -> {log.info(" task list {}",tasks);
				log.info("total tasks fetched {}",tasks.size());})
				.doOnError(e -> log.error("Error fetching tasks", e));
			
		
	}
	
	 class TaskDetailsRowMapper implements RowMapper<TaskDetails>{

		@Override
		public TaskDetails mapRow(ResultSet rs, int rowNum) throws SQLException {
			return TaskDetails.builder().ticketId(rs.getString("TICKET_ID"))
					                    .taskName(rs.getString("task_name"))
					                    .taskDescription(rs.getString("task_desc"))
					                    .taskFeedback(rs.getString("task_feedback"))
					                    .taskType(new TaskType(rs.getString("task_type_cd"),rs.getString("task_type_desc")))
					                    .assignedTo(new AssingedTo(rs.getString("touserid"),rs.getString("tousername")))
					                    .assignedBy(new AssingedBy(rs.getString("byuserId"),rs.getString("byusername")))
					                    .createdBy(rs.getString("created_by"))
					                    .createdDate(rs.getString("created_ts"))
					                    .updatedDate(rs.getString("updated_ts"))
					                    .status(new TaskStatus(rs.getString("status_cd"),rs.getString("status")))
					                    .dueDate(rs.getString("due_date"))
										.build();
					
		}
		 
	 }
	 
	 public Mono<List<TaskDetails>> getUserTasks(String userId){
			
			log.info("entered All Tasks ");
			
			
			String sql = "SELECT\n"+
					"				    t.ticket_id,\n"+
					"				    t.task_name,\n"+
					"				    t.task_desc,\n"+
					"                    t.task_type_cd,\n"+
					"				    t.task_feedback,\n"+
					"				    tt.task_type_desc,\n"+
					"                    up.user_id touserid,\n"+
					"				    up.first_name|| ', '|| up.last_name as tousername,\n"+
					"                    up1.user_id as byuserId,\n"+
					"				    up1.first_name|| ', '|| up1.last_name as byusername,\n"+
					"				    t.created_by,\n"+
					"				    to_char(t.created_ts, 'DD-MON-YYYY hh:mm:ss AM') AS created_ts,\n"+
					"				    to_char(t.updated_ts, 'DD-MON-YYYY hh:mm:ss AM') AS updated_ts,\n"+
					"				    ts.status,\n"+
					"                    ts.status_cd,\n"+
					"				    to_char(t.due_date, 'DD-MON-YYYY')               AS due_date\n"+
					"FROM\n"+
					"    tasks t,\n"+
					"    task_type tt,\n"+
					"    user_profile up,\n"+
					"    user_profile up1,\n"+
					"    task_status ts    \n"+
					"    where t.task_type_cd=tt.task_type_cd and\n"+
					"    t.assigned_to=up.user_id\n"+
					"    and t.assigned_by=up1.user_id\n"+
					"    and ts.status_cd=t.status_cd\n"+
					"    and up.user_id= ? \n"+
					"ORDER BY\n"+
					"    updated_ts DESC";
			return Mono.fromCallable(() ->{			
			 return oracleJdbcTemplate.query(sql,new TaskDetailsRowMapper(),userId);
			}).subscribeOn(Schedulers.boundedElastic())
					.doOnSuccess(tasks -> {log.info(" task list {}",tasks);
					log.info("total tasks fetched {}",tasks.size());})
					.doOnError(e -> log.error("Error fetching tasks", e));
				
			
		}
	 
	 public Mono<Boolean> updateTask(TaskDetails taskDetails,String userId) throws JsonProcessingException{
		 	
		 	log.info("final sql :: {}",sql);
		 	log.info("Feedback :: {}",taskDetails.getTaskFeedbackList());
		 	return Mono.fromCallable(() ->{
		 		int result=0;
		 		try {
		 			
		 			String feedbacksql="select task_feedback from tasks where ticket_id=?";
		 			
		 			String exisitingfeedback= oracleJdbcTemplate.queryForObject(feedbacksql, String.class, taskDetails.getTicketId());
		 			
		 			log.info("exisiting Feedback from DB :: {} ",exisitingfeedback);
		 			if(taskDetails.getTaskFeedback() != "" && !"".equals(taskDetails.getTaskFeedback())) {
		 				taskDetails.setTaskFeedbackJson(TaskFeedback.builder()
		 				        .feedback(taskDetails.getTaskFeedback())
		 				        .feedbackBy(userId)
		 				        .feedbackAt(new Timestamp(new Date().getTime()).toString())
		 				        .status(taskDetails.getStatus().getStatus())
		 				        .build());
		 				 String feedback = new ObjectMapper().writeValueAsString(taskDetails.getTaskFeedbackJson());
		 				 if(exisitingfeedback !=null && !("").equals(exisitingfeedback))
		 				exisitingfeedback="["+feedback+","+exisitingfeedback.substring(1);
		 				 else
		 					exisitingfeedback="["+feedback+"]";
		 					 
		 			}
		 			log.info("exisiting Feedback after adding  feedbcak :: {} ",exisitingfeedback);
		 			
		 			// adding feedback using query it self 
//		 			String sql ="update tasks set task_name=?,task_desc=?,"+
//				 			" task_feedback = \n"+
//							"    CASE \n"+
//							"        WHEN task_feedback IS NULL OR TRIM(task_feedback) = '' THEN \n"+
//							"            '[' || ? || ']'\n"+
//							"        WHEN TRIM(task_feedback) LIKE '%[%' THEN \n"+
//							"           '['||?||','|| SUBSTR(TRIM(task_feedback), 2, LENGTH(TRIM(task_feedback)))\n"+
//							"        ELSE \n"+
//							"            '[' || ? || ']'\n"+
//							"    END ,\n"+
//				 		    "task_type_cd=?,"
//				 			+ "due_date=? ,"
//				 			+ "assigned_to=?,assigned_by=?,"
//				 										+ "status_cd=?,updated_ts=current_timestamp where ticket_id=?";
//		 			
		 			
		 			String sql ="update tasks set task_name=?,task_desc=?,"+
				 			" task_feedback = ? ,\n"+
				 		    "task_type_cd=?,"
				 			+ "due_date=TO_DATE(?, 'DD-MON-YYYY') ,"
				 			+ "assigned_to=?,assigned_by=?,"
				 			+ "status_cd=?,updated_ts=current_timestamp where ticket_id=?";
		 			
					 result= oracleJdbcTemplate.update(sql, 
							 taskDetails.getTaskName(),
							 taskDetails.getTaskDescription(),
							 exisitingfeedback,
		  					  taskDetails.getTaskType().getType(),
		  					 taskDetails.getDueDate(),
		  					  taskDetails.getAssignedTo().getUserId(),
		  					  taskDetails.getAssignedBy().getUserId(),
		  					  taskDetails.getStatus().getStatusCd(),
		  					  taskDetails.getTicketId());
					 
					 notificaion.createNotification(taskDetails.getTicketId(), taskDetails.getAssignedTo().getUserId(), "Task Details is Updated...!");
					 
				}
		 		catch (Exception e) {
		 			e.printStackTrace();
				}
		 		
		 		return result >0;

		 	}).subscribeOn(Schedulers.boundedElastic())
		 			.doOnSuccess(status -> {log.info("update status :: {}",status);})
		 			.doOnError(e -> log.error("error updating task",e));
		 			
			  
		 
		 
	 }
}
