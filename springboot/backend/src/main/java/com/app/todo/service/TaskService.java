package com.app.todo.service;

import com.app.todo.dto.TaskDto;
import com.app.todo.dto.TaskRequestDto;
import java.util.List;

public interface TaskService {
    List<TaskDto> getAllTasks();
    TaskDto getTaskById(Long id);
    TaskDto createTask(TaskRequestDto requestDto);
    TaskDto updateTask(Long id, TaskRequestDto requestDto);
    void deleteTask(Long id);
}
