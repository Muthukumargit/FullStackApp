package com.userservice.model;

import java.sql.Timestamp;

import com.fasterxml.jackson.annotation.JsonAlias;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class NotificationDTO {

	private long id;
	private String ticketId;
	private String userId;
	private String message;
	private int ReadIn;
	private String notificationTs;
	
}
