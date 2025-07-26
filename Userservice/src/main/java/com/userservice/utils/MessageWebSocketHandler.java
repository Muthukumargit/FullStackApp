package com.userservice.utils;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.socket.WebSocketHandler;
import org.springframework.web.reactive.socket.WebSocketMessage;
import org.springframework.web.reactive.socket.WebSocketSession;
import org.springframework.web.util.UriComponentsBuilder;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.userservice.service.MessageService;
import com.userservice.service.UserStatusService;

import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Slf4j
@Component
public class MessageWebSocketHandler implements WebSocketHandler {

	private final Map<String, WebSocketSession> activeSessions = new ConcurrentHashMap<>();
	
	
	
		    @Autowired
		    private MessageService messageService;
		    
		    @Autowired
		    private UserStatusService userservice;
	
		    @Autowired
		    private UserStatusService userStatusService;
	
		    @Override
		    public Mono<Void> handle(WebSocketSession session) {
		        String userId = getUserId(session);
		        activeSessions.put(userId, session);
		        userStatusService.setUserOnline(userId, true);
		        broadcastUserStatus(userId);
	
		        Flux<WebSocketMessage> inbound = session.receive()
		            .flatMap(msg -> {
		                String json = msg.getPayloadAsText();
		                return handleIncomingMessage(json, userId)
		                		.then(Mono.empty());
		            });
	
		        return session.send(Mono.empty()) // No outbound stream here
		                .and(inbound.then())
		                .doFinally(signal -> {
		                    activeSessions.remove(userId);
		                    userStatusService.setUserOnline(userId, false);
		                    broadcastUserStatus(userId);
		                });
		    }
	
		    private String getUserId(WebSocketSession session) {
		        return UriComponentsBuilder.fromUri(session.getHandshakeInfo().getUri())
		            .build()
		            .getQueryParams()
		            .getFirst("userId");
		    }
	
		    private Mono<Void> handleIncomingMessage(String json, String senderId) {
		        ObjectMapper mapper = new ObjectMapper();
		        try {
		            JsonNode node = mapper.readTree(json);
		            String type = node.get("type").asText();
	
		            switch (type) {
		                case "chat": {
		                    String to = node.get("to").asText();
		                    String content = node.get("content").asText();
	
		                    messageService.saveMessage(senderId, to, content);
	
		                    if (activeSessions.containsKey(to)) {
		                        WebSocketSession session = activeSessions.get(to);
		                        return session.send(Mono.just(session.textMessage(json))).then();
		                    }
		                    break;
		                }
	
		                case "seen": {
		                    String from = node.get("from").asText();
		                    messageService.markMessagesAsSeen(from, senderId);
		                    break;
		                }
	
		                default:
		                    System.out.println("Unknown WebSocket message type: " + type);
		            }
	
		        } catch (Exception e) {
		            e.printStackTrace();
		        }
	
		        return Mono.empty();
		    }
	
		    public void sendToUser(String userId, String payloadJson) {
		        WebSocketSession session = activeSessions.get(userId);
		        if (session != null && session.isOpen()) {
		            session.send(Mono.just(session.textMessage(payloadJson))).subscribe();
		        }
		    }
	
		    public boolean isUserOnline(String userId) {
		        return activeSessions.containsKey(userId);
		    }
		    
		    public void broadcastUserStatus(String userId) {
		    		    	
		    	List<Map<String, Object>> list = userservice.getUsersWithStatus(userId);
		       
		    	log.info("Active user list :: {}",list);
		    	Map<String, Object> message = Map.of(
		    	"type", "onlineList",
		    	"users", list
		    	);
		    	ObjectMapper mapper = new ObjectMapper();
		    	String json = "";
		    	try {
					json = mapper.writeValueAsString(message);
				} catch (JsonProcessingException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
//		    	log.info("list of users :: {}",list.toString());
		    	String finaljson=json;
		        activeSessions.values().forEach(session ->
		            session.send(Mono.just(session.textMessage(finaljson))).subscribe()
		        );
		    }

}
