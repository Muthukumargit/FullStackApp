package com.userservice.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.userservice.service.MessageService;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
public class MessageController {

    @Autowired
    private MessageService messageService;

    @GetMapping("/chat")
    public ResponseEntity<?> getChatHistory(@RequestParam String user1, @RequestParam String user2) {
    	log.info("inside chat history :: {}",user1,user2);
        return ResponseEntity.ok(messageService.getChatHistory(user1, user2));
    }

    @GetMapping("/unread")
    public ResponseEntity<?> getUnread(@RequestParam String userId, @RequestParam String fromId) {
        return ResponseEntity.ok(Map.of("unread", messageService.getUnreadCount(userId, fromId)));
    }
}
