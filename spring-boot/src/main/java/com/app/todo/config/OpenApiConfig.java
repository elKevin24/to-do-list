package com.app.todo.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("To-Do List API")
                        .version("1.0.0")
                        .description("API REST profesional para gestionar una lista de tareas (To-Do List). Construida con Spring Boot 4.x, Spring Data JPA, MapStruct y base de datos H2.")
                        .contact(new Contact()
                                .name("Tu Mentor Técnico")
                                .email("mentor@todoapp.com")));
    }
}
