package com.gatewayapi.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.ReactiveUserDetailsService;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.gatewayapi.Dao.UserDao;
import com.gatewayapi.Model.UserPrincipal;
import com.gatewayapi.Model.Users;

import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;


@Slf4j
@Service
public class MyUserDetailsService implements ReactiveUserDetailsService{

	
	@Autowired
	private UserDao dao;
	

	@Override
	public Mono<UserDetails> findByUsername(String username)throws UsernameNotFoundException {
		
		return Mono.fromCallable(() ->{
			Users user=dao.getUserByUserId(username);
			if(user==null){
				throw new UsernameNotFoundException("User Not Found in DB");
			}
			UserDetails ud=new UserPrincipal(user);
			return ud;
		}).subscribeOn(Schedulers.boundedElastic());
		
		
	}

	
}
