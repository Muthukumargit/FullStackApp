package com.gatewayapi.Service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import com.gatewayapi.Dao.EmailVerificationDao;
import com.gatewayapi.Model.userprofileDto;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {
	
	@Autowired
	private JavaMailSender mailSender;
	
	@Autowired
	private Environment env;
	
	@Autowired
	private EmailVerificationDao dao;
	
	 public void sendEmail(String toEmail, String subject, String body) throws MessagingException {
		 MimeMessage message = mailSender.createMimeMessage();
		 MimeMessageHelper helper=new MimeMessageHelper(message, true);
	        helper.setFrom(env.getProperty("email.senderid"));
	        helper.setTo(toEmail);
	        helper.setSubject(subject);
	        helper.setText(body,true);
	        mailSender.send(message);
	        System.out.println("Email sent successfully to " + toEmail);
	    }
	 
	 public String emailVerificationDetail(userprofileDto user,Map<String, Object> token,String Expire) throws MessagingException {
		 String result =dao.emailVerificationDetail(user.getUserId(), token.get("plainToken").toString(),token.get("plainTokenId").toString(), Expire);
		 System.out.println("Result from DB :: "+result);
		 if(result.equalsIgnoreCase("Success")) {
			 sendEmail(user.getEmail(), "Email verification", createMailBody(user.getFirstName()+" "+user.getLastName(),token.get("token").toString()));
			 return "Mail Triggered Successs";
		 }		 
		 else {
			 return result;
		 }
		 
//		return result;
	 }
	 
	 public String createMailBody(String userName,String token) {
			
			String encodedToken = URLEncoder.encode(token, StandardCharsets.UTF_8);
			
			String baseUrl="http://localhost:20000/emailVerification";
			if(env.getActiveProfiles()[0].equalsIgnoreCase("prod"))
				baseUrl="https://reactapp-gatewayapi.onrender.com/emailVerification";
			
			String url=baseUrl+"?verificationToken="+encodedToken;
			
			String message = "<!DOCTYPE html>" +
				    "<html>" +
				    "<head>" +
				    "  <meta charset='UTF-8'>" +
				    "  <title>Email Verification</title>" +
				    "</head>" +
				    "<body style='text-align: center; line-height: 1.6; font-family: Arial, sans-serif;'>" +
				    "  <p><b>Hi " + userName + ",</b></p>" +
				    "  <p>Please click the button below to verify your email address:</p>" +
				    "  <a href='" + url + "' " +
				    "     style='display: inline-block; background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;'>Verify Email</a>" +
				    "  <p>If you didn’t request this, please ignore this email.</p>" +
				    "</body>" +
				    "</html>";
			return message;
		}
	 
	 public String verifyEmail(String userId,String tokenId) throws Exception {
		 try {
			 return dao.verifyEmail(userId, tokenId);
		 }catch (Exception e) {
			// TODO: handle exception
			 throw new Exception("Not a valid token");
		}
		
		 
	 }

}
