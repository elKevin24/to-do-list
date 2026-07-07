package com.app.todo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskRequestDto {

    @NotBlank(message = "El título de la tarea no puede estar vacío")
    @Size(max = 150, message = "El título no puede superar los 150 caracteres")
    private String title;

    @Size(max = 1000, message = "La descripción no puede superar los 1000 caracteres")
    private String description;

    private Boolean completed; // Usamos la clase envolvente Boolean para permitir valores nulos en la creación
}
