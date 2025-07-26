package com.userservice.utils;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

import org.springframework.stereotype.Component;
import org.springframework.web.reactive.socket.WebSocketHandler;
import org.springframework.web.reactive.socket.WebSocketSession;
import org.springframework.web.util.UriComponentsBuilder;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.userservice.model.NotificationDTO;

import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Mono;

@Slf4j
@Component
public class NotificationWebSocketHandler implements WebSocketHandler {
	
	
	
	 private final Map<String, List<WebSocketSession>> userSessions = new ConcurrentHashMap<>();

	@Override
	public Mono<Void> handle(WebSocketSession session) {
		 String userId = getUserIdFromUri(session);
		 log.info("Registering session for user: {}", userId);
		 userSessions.computeIfAbsent(userId, k -> new CopyOnWriteArrayList<>()).add(session);
		 log.info("Active sessions for '{}': {}", userId, userSessions.get(userId).size());

	        return session.receive()
	            .doOnTerminate(() -> removeSession(userId, session))
	            .then();
	}
	
	public String getUserIdFromUri(WebSocketSession session) {
		return UriComponentsBuilder.fromUri(session.getHandshakeInfo().getUri()).build().getQueryParams()
				.getFirst("userId");
	}
	
	private void removeSession(String userId,WebSocketSession session) {
		 List<WebSocketSession> sessions = userSessions.get(userId);
	        if (sessions != null) {
	            sessions.remove(session);
	            if (sessions.isEmpty()) {
	                userSessions.remove(userId);
	            }
	        }
	}
	public void sendToUser(String userId, NotificationDTO notification) {
		
		log.info("Sending Notification to user :: {} ",userId);
        List<WebSocketSession> sessions = userSessions.get(userId);
        if (sessions == null || sessions.isEmpty()) {
            log.warn("No active WebSocket sessions for user: {}", userId);
            return;
        }
        if (sessions != null) {
        	ObjectMapper mapper = new ObjectMapper();
        	String json = null;
			try {
				json = mapper.writeValueAsString(notification);
			} catch (JsonProcessingException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
            for (WebSocketSession session : sessions) {
                session.send(Mono.just(session.textMessage(json))).subscribe();
            }
            log.info("notification sended :: {} ",userId);
        }
    }

}
