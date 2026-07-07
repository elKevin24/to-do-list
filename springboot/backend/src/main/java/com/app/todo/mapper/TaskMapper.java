package com.app.todo.mapper;

import com.app.todo.dto.TaskDto;
import com.app.todo.dto.TaskRequestDto;
import com.app.todo.model.Task;
import org.mapstruct.*;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface TaskMapper {

    // Convierte de Entidad a DTO de respuesta
    TaskDto toDto(Task task);

    // Convierte de DTO de petición a Entidad
    Task toEntity(TaskRequestDto requestDto);

    // Actualiza una entidad existente usando los datos no nulos del DTO
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntityFromDto(TaskRequestDto requestDto, @MappingTarget Task task);
}
