package com.app.todo.service.impl;

import com.app.todo.dto.TaskDto;
import com.app.todo.dto.TaskRequestDto;
import com.app.todo.exception.ResourceNotFoundException;
import com.app.todo.mapper.TaskMapper;
import com.app.todo.model.Task;
import com.app.todo.repository.TaskRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TaskServiceImplTest {

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private TaskMapper taskMapper;

    @InjectMocks
    private TaskServiceImpl taskService;

    private Task task;
    private TaskDto taskDto;
    private TaskRequestDto taskRequestDto;

    @BeforeEach
    void setUp() {
        task = Task.builder()
                .id(1L)
                .title("Test Task")
                .description("Test Description")
                .completed(false)
                .createdAt(LocalDateTime.now())
                .build();

        taskDto = TaskDto.builder()
                .id(1L)
                .title("Test Task")
                .description("Test Description")
                .completed(false)
                .createdAt(task.getCreatedAt())
                .build();

        taskRequestDto = TaskRequestDto.builder()
                .title("Test Task")
                .description("Test Description")
                .completed(false)
                .build();
    }

    @Test
    void getAllTasks_ShouldReturnDtoList() {
        // Given
        when(taskRepository.findAll()).thenReturn(Arrays.asList(task));
        when(taskMapper.toDto(task)).thenReturn(taskDto);

        // When
        List<TaskDto> result = taskService.getAllTasks();

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(taskDto.getTitle(), result.get(0).getTitle());
        verify(taskRepository, times(1)).findAll();
        verify(taskMapper, times(1)).toDto(task);
    }

    @Test
    void getTaskById_WhenIdExists_ShouldReturnDto() {
        // Given
        when(taskRepository.findById(1L)).thenReturn(Optional.of(task));
        when(taskMapper.toDto(task)).thenReturn(taskDto);

        // When
        TaskDto result = taskService.getTaskById(1L);

        // Then
        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("Test Task", result.getTitle());
        verify(taskRepository, times(1)).findById(1L);
    }

    @Test
    void getTaskById_WhenIdDoesNotExist_ShouldThrowResourceNotFoundException() {
        // Given
        when(taskRepository.findById(1L)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(ResourceNotFoundException.class, () -> taskService.getTaskById(1L));
        verify(taskRepository, times(1)).findById(1L);
        verify(taskMapper, never()).toDto(any());
    }

    @Test
    void createTask_ShouldReturnCreatedDto() {
        // Given
        when(taskMapper.toEntity(taskRequestDto)).thenReturn(task);
        when(taskRepository.save(any(Task.class))).thenReturn(task);
        when(taskMapper.toDto(task)).thenReturn(taskDto);

        // When
        TaskDto result = taskService.createTask(taskRequestDto);

        // Then
        assertNotNull(result);
        assertEquals("Test Task", result.getTitle());
        verify(taskRepository, times(1)).save(any(Task.class));
    }

    @Test
    void updateTask_WhenIdExists_ShouldReturnUpdatedDto() {
        // Given
        when(taskRepository.findById(1L)).thenReturn(Optional.of(task));
        doNothing().when(taskMapper).updateEntityFromDto(taskRequestDto, task);
        when(taskRepository.save(task)).thenReturn(task);
        when(taskMapper.toDto(task)).thenReturn(taskDto);

        // When
        TaskDto result = taskService.updateTask(1L, taskRequestDto);

        // Then
        assertNotNull(result);
        assertEquals("Test Task", result.getTitle());
        verify(taskRepository, times(1)).findById(1L);
        verify(taskRepository, times(1)).save(task);
    }

    @Test
    void updateTask_WhenIdDoesNotExist_ShouldThrowResourceNotFoundException() {
        // Given
        when(taskRepository.findById(1L)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(ResourceNotFoundException.class, () -> taskService.updateTask(1L, taskRequestDto));
        verify(taskRepository, times(1)).findById(1L);
        verify(taskRepository, never()).save(any());
    }

    @Test
    void deleteTask_WhenIdExists_ShouldDeleteTask() {
        // Given
        when(taskRepository.findById(1L)).thenReturn(Optional.of(task));
        doNothing().when(taskRepository).delete(task);

        // When
        assertDoesNotThrow(() -> taskService.deleteTask(1L));

        // Then
        verify(taskRepository, times(1)).findById(1L);
        verify(taskRepository, times(1)).delete(task);
    }

    @Test
    void deleteTask_WhenIdDoesNotExist_ShouldThrowResourceNotFoundException() {
        // Given
        when(taskRepository.findById(1L)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(ResourceNotFoundException.class, () -> taskService.deleteTask(1L));
        verify(taskRepository, times(1)).findById(1L);
        verify(taskRepository, never()).delete(any());
    }
}
