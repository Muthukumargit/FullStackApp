package com.userservice.config;

import java.util.HashMap;
import java.util.Map;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.HandlerMapping;
import org.springframework.web.reactive.handler.SimpleUrlHandlerMapping;
import org.springframework.web.reactive.socket.WebSocketHandler;
import org.springframework.web.reactive.socket.server.support.WebSocketHandlerAdapter;

import com.userservice.utils.MessageWebSocketHandler;
import com.userservice.utils.NotificationWebSocketHandler;

@Configuration
public class WebSocketConfig {

	@Bean
    public HandlerMapping handlerMapping(NotificationWebSocketHandler handler,MessageWebSocketHandler msghandler) {
        Map<String, WebSocketHandler> map = new HashMap<>();
        map.put("/ws/notifications", handler);
        map.put("/ws/messages", msghandler);
        return new SimpleUrlHandlerMapping(map, -1);
    }

    @Bean
    public WebSocketHandlerAdapter handlerAdapter() {
        return new WebSocketHandlerAdapter();
    }
    
}
