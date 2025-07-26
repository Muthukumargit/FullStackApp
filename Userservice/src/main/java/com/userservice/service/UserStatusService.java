package com.userservice.service;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class UserStatusService {

	@Autowired
    private JdbcTemplate oracJdbcTemplate;

    public void setUserOnline(String userId, boolean online) {
    	log.info("user id :: {}", userId," online status :: {}",online);
    	oracJdbcTemplate.update("MERGE INTO user_status u USING dual ON (u.user_id = ?) " +
                "WHEN MATCHED THEN UPDATE SET online_status = ?, last_active = CURRENT_TIMESTAMP " +
                "WHEN NOT MATCHED THEN INSERT (user_id, online_status, last_active) VALUES (?, ?, CURRENT_TIMESTAMP)",
                userId, online ? 1 : 0, userId, online ? 1 : 0);
    }

    public List<Map<String, Object>> getUsersWithStatus(String userId) {
        return oracJdbcTemplate.queryForList("SELECT * FROM user_status");
    }
}
