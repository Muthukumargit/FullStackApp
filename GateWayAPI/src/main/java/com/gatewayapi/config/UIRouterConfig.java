package com.gatewayapi.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.server.RouterFunction;
import org.springframework.web.reactive.function.server.ServerResponse;

import com.fasterxml.jackson.databind.annotation.JsonAppend.Prop;

import static org.springframework.web.reactive.function.server.RequestPredicates.*;
import static org.springframework.web.reactive.function.server.RouterFunctions.*;

@Profile("prod")
@Configuration
public class UIRouterConfig {

    @Bean
    public RouterFunction<ServerResponse> htmlRouter() {
        return resources("/UI/assets/**", new ClassPathResource("static/UI/assets/"))
            // Serve index.html at root
            .andRoute(GET("/UI"), request ->
                ServerResponse.ok()
                    .contentType(MediaType.TEXT_HTML)
                    .bodyValue(new ClassPathResource("static/UI/index.html")))
            .andRoute(GET("/UI/"), request ->
                ServerResponse.ok()
                    .contentType(MediaType.TEXT_HTML)
                    .bodyValue(new ClassPathResource("static/UI/index.html")))
            // Fallback for all non-static UI routes
            .andRoute(path("/UI/{*path}").and(accept(MediaType.TEXT_HTML)), request -> {
                String path = request.path();
                if (path.contains("/assets/") || path.contains(".")) {
                    return ServerResponse.notFound().build(); // Let static resource handler handle it
                }
                return ServerResponse.ok()
                    .contentType(MediaType.TEXT_HTML)
                    .bodyValue(new ClassPathResource("static/UI/index.html"));
            });
    }
}
