package com.userservice.config;

import javax.sql.DataSource;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

@Configuration
public class DatabaseConfig {
	
	@ConfigurationProperties(prefix = "oracle.datasource")
	@Bean
	public DataSource getOracleLookUp() {
		return DataSourceBuilder.create().build();
	}
	
	@Bean
	public JdbcTemplate oracleTemplate() {
		return new JdbcTemplate(getOracleLookUp());
		
	}

}
