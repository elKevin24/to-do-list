package com.app.todo.controller;

import com.app.todo.dto.TaskDto;
import com.app.todo.dto.TaskRequestDto;
import com.app.todo.exception.ResourceNotFoundException;
import com.app.todo.service.TaskService;
import tools.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.Arrays;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(TaskController.class)
class TaskControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private TaskService taskService;

    @Autowired
    private ObjectMapper objectMapper;

    private TaskDto taskDto;
    private TaskRequestDto taskRequestDto;

    @BeforeEach
    void setUp() {
        taskDto = TaskDto.builder()
                .id(1L)
                .title("Controller Test Task")
                .description("Controller Test Description")
                .completed(false)
                .createdAt(LocalDateTime.now())
                .build();

        taskRequestDto = TaskRequestDto.builder()
                .title("Controller Test Task")
                .description("Controller Test Description")
                .completed(false)
                .build();
    }

    @Test
    void getAllTasks_ShouldReturnTasksList() throws Exception {
        when(taskService.getAllTasks()).thenReturn(Arrays.asList(taskDto));

        mockMvc.perform(get("/api/tasks"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$[0].id").value(1L))
                .andExpect(jsonPath("$[0].title").value("Controller Test Task"));

        verify(taskService, times(1)).getAllTasks();
    }

    @Test
    void getTaskById_WhenExists_ShouldReturnTask() throws Exception {
        when(taskService.getTaskById(1L)).thenReturn(taskDto);

        mockMvc.perform(get("/api/tasks/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.title").value("Controller Test Task"));

        verify(taskService, times(1)).getTaskById(1L);
    }

    @Test
    void getTaskById_WhenDoesNotExist_ShouldReturn404() throws Exception {
        when(taskService.getTaskById(1L)).thenThrow(new ResourceNotFoundException("No se encontró la tarea con ID: 1"));

        mockMvc.perform(get("/api/tasks/1"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").value("No se encontró la tarea con ID: 1"));

        verify(taskService, times(1)).getTaskById(1L);
    }

    @Test
    void createTask_WithValidData_ShouldReturnCreatedTask() throws Exception {
        when(taskService.createTask(any(TaskRequestDto.class))).thenReturn(taskDto);

        mockMvc.perform(post("/api/tasks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(taskRequestDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.title").value("Controller Test Task"));

        verify(taskService, times(1)).createTask(any(TaskRequestDto.class));
    }

    @Test
    void createTask_WithInvalidData_ShouldReturn400BadRequest() throws Exception {
        TaskRequestDto invalidRequest = TaskRequestDto.builder()
                .title("") // Título vacío (debería fallar @NotBlank)
                .description("Desc")
                .build();

        mockMvc.perform(post("/api/tasks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.validationErrors.title").value("El título de la tarea no puede estar vacío"));

        verify(taskService, never()).createTask(any());
    }

    @Test
    void updateTask_WithValidData_ShouldReturnUpdatedTask() throws Exception {
        when(taskService.updateTask(eq(1L), any(TaskRequestDto.class))).thenReturn(taskDto);

        mockMvc.perform(put("/api/tasks/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(taskRequestDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.title").value("Controller Test Task"));

        verify(taskService, times(1)).updateTask(eq(1L), any(TaskRequestDto.class));
    }

    @Test
    void deleteTask_ShouldReturn204NoContent() throws Exception {
        doNothing().when(taskService).deleteTask(1L);

        mockMvc.perform(delete("/api/tasks/1"))
                .andExpect(status().isNoContent());

        verify(taskService, times(1)).deleteTask(1L);
    }
}
