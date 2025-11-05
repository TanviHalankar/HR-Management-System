package com.example.hrms.apigateway;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;

@Configuration
public class CorsConfig {

    @Bean
    @Order(Ordered.HIGHEST_PRECEDENCE)
    public WebFilter corsFilter() {
        return (ServerWebExchange exchange, WebFilterChain chain) -> {
            ServerHttpRequest request = exchange.getRequest();
            ServerHttpResponse response = exchange.getResponse();
            String origin = request.getHeaders().getFirst(HttpHeaders.ORIGIN);

            // Add CORS headers to all responses
            if (origin != null) {
                HttpHeaders headers = response.getHeaders();
                
                // Remove any existing CORS headers first to avoid duplicates
                headers.remove(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN);
                headers.remove(HttpHeaders.ACCESS_CONTROL_ALLOW_METHODS);
                headers.remove(HttpHeaders.ACCESS_CONTROL_ALLOW_HEADERS);
                headers.remove(HttpHeaders.ACCESS_CONTROL_EXPOSE_HEADERS);
                headers.remove(HttpHeaders.ACCESS_CONTROL_MAX_AGE);
                
                // Now set the CORS headers (only once)
                headers.set(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, origin);
                headers.set(HttpHeaders.ACCESS_CONTROL_ALLOW_METHODS, "GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD");
                headers.set(HttpHeaders.ACCESS_CONTROL_ALLOW_HEADERS, "*");
                headers.set(HttpHeaders.ACCESS_CONTROL_EXPOSE_HEADERS, "*");
                headers.set(HttpHeaders.ACCESS_CONTROL_MAX_AGE, "3600");

                // Handle preflight OPTIONS requests
                if (request.getMethod() == HttpMethod.OPTIONS) {
                    response.setStatusCode(HttpStatus.OK);
                    return response.setComplete();
                }
            }

            return chain.filter(exchange);
        };
    }
}
