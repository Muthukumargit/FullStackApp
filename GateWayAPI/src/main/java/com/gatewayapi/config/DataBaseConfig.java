package com.gatewayapi.config;
//
import javax.sql.DataSource;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;
import org.springframework.jdbc.core.JdbcTemplate;

@Configuration
public class DataBaseConfig {
	
	@Bean
	@ConfigurationProperties(prefix = "oracle.datasource")
	public DataSource getOracleDataSource() {
		return DataSourceBuilder.create().build();
	}
	
	
	@Bean
	public JdbcTemplate oracleTemplate() {		
		return new JdbcTemplate(getOracleDataSource());
	}

}