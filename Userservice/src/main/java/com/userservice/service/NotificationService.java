package com.userservice.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.userservice.dao.NotificationDao;
import com.userservice.model.NotificationDTO;

import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Mono;

@Slf4j
@Service
public class NotificationService {
	
	@Autowired
	private NotificationDao dao;
	
	public Mono<List<NotificationDTO>> getUserNotification(String userId){
		return dao.getUserNotification(userId);
	}
	
	public int createNotification(String ticketId,String userId,String message) {
		log.info("entered into create notification with values ticketId ::"+ticketId+" userId ::"+userId+" Message ::"+message);
		return dao.createNotification(ticketId, userId, message);
	}

}
