package com.userservice.service;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

@Service
public class MessageService {

    @Autowired
    private JdbcTemplate oracJdbcTemplate;

    public void saveMessage(String sender, String receiver, String content) {
        oracJdbcTemplate.update("INSERT INTO messages (sender_id, receiver_id, content, seen) VALUES (?, ?, ?, 0)",
                sender, receiver, content);
    }

    public void markMessagesAsSeen(String from, String to) {
        oracJdbcTemplate.update("UPDATE messages SET seen = 1 WHERE sender_id = ? AND receiver_id = ? AND seen = 0",
                from, to);
    }

    public List<Map<String, Object>> getChatHistory(String user1, String user2) {
        return oracJdbcTemplate.queryForList("SELECT * FROM messages WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?) ORDER BY sent_at",
                user1, user2, user2, user1);
    }

    public int getUnreadCount(String userId, String fromId) {
        return oracJdbcTemplate.queryForObject("SELECT COUNT(*) FROM messages WHERE receiver_id = ? AND sender_id = ? AND seen = 0",
                Integer.class, userId, fromId);
    }
}

