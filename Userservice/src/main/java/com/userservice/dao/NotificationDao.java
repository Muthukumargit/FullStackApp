package com.userservice.dao;

import java.math.BigDecimal;
import java.sql.PreparedStatement;
import java.sql.Timestamp;
import java.util.Date;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.userservice.model.NotificationDTO;
import com.userservice.utils.NotificationWebSocketHandler;

import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

@Slf4j
@Repository
public class NotificationDao {
	
	@Autowired
	private JdbcTemplate oracleJdbcTemplate;
	
	@Autowired
	private NotificationWebSocketHandler websocket;
	
	public Mono<List<NotificationDTO>> getUserNotification(String userId){
		
		return Mono.fromCallable(() ->{
			
			return oracleJdbcTemplate.query("select id,ticket_id,user_id,message,read_in,notification_ts from notification where user_id=? order by notification_ts desc fetch first 10 rows only", new BeanPropertyRowMapper<>(NotificationDTO.class), userId);
			
		}).subscribeOn(Schedulers.boundedElastic())
		  .doOnSuccess(result -> log.info("Notification size :: {}",result))
		  .doOnError(e -> log.error("error on Notification {}",e));
		
	}
	
	public int createNotification(String ticketId,String userId,String message) {
		
		String sql="insert into notification (ticket_id,user_id,message) values (?,?,?)";
		
		KeyHolder keyHolder = new GeneratedKeyHolder();		
		int result=oracleJdbcTemplate.update(connection ->{
			PreparedStatement ps = connection.prepareStatement(sql,new String[] {"id"
					});
			log.info("inside Notification 1st ");
			ps.setString(1,ticketId);
			ps.setString(2,userId);
			ps.setString(3,message);
			return ps;
			},keyHolder);
		
		
		log.info("keyHolder :: "+keyHolder);
		Map<String, Object> keys= keyHolder.getKeys();
		if(keys == null || !keys.containsKey("id") ) {
			throw new RuntimeException("Generated keys not found");
		}
		
		long generatedKey= ((BigDecimal) keys.get("id")).longValue();
		NotificationDTO notification = NotificationDTO.builder()
													  .id(generatedKey)
													  .message(message)
													  .userId(userId)
													  .ReadIn(0)
													  .ticketId(ticketId)
													  .notificationTs(new Timestamp(new Date().getTime()).toString())
													  .build();
		
		log.info("Notification Details ::"+notification);
		
		
		websocket.sendToUser(userId, notification);
		
		return result;
	}

}
