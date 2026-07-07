package com.app.todo.service.impl;

import com.app.todo.dto.TaskDto;
import com.app.todo.dto.TaskRequestDto;
import com.app.todo.exception.ResourceNotFoundException;
import com.app.todo.mapper.TaskMapper;
import com.app.todo.model.Task;
import com.app.todo.repository.TaskRepository;
import com.app.todo.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class TaskServiceImpl implements TaskService {

    private final TaskRepository taskRepository;
    private final TaskMapper taskMapper;

    @Override
    @Transactional(readOnly = true)
    public List<TaskDto> getAllTasks() {
        return taskRepository.findAll()
                .stream()
                .map(taskMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public TaskDto getTaskById(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("No se encontró la tarea con ID: " + id));
        return taskMapper.toDto(task);
    }

    @Override
    public TaskDto createTask(TaskRequestDto requestDto) {
        Task task = taskMapper.toEntity(requestDto);
        // El estado completed se establece por defecto como false en el ciclo de vida de la entidad Task (@PrePersist)
        // si no se envía en la petición.
        if (requestDto.getCompleted() != null) {
            task.setCompleted(requestDto.getCompleted());
        }
        Task savedTask = taskRepository.save(task);
        return taskMapper.toDto(savedTask);
    }

    @Override
    public TaskDto updateTask(Long id, TaskRequestDto requestDto) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("No se encontró la tarea con ID: " + id));
        
        taskMapper.updateEntityFromDto(requestDto, task);
        
        // Actualizamos completed explícitamente si se envió en la petición
        if (requestDto.getCompleted() != null) {
            task.setCompleted(requestDto.getCompleted());
        }

        Task updatedTask = taskRepository.save(task);
        return taskMapper.toDto(updatedTask);
    }

    @Override
    public void deleteTask(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("No se encontró la tarea con ID: " + id));
        taskRepository.delete(task);
    }
}
