package com.app.todo.repository;

import com.app.todo.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    // Aquí podemos definir consultas personalizadas si lo requerimos más adelante.
    // Al heredar de JpaRepository, ya tenemos CRUD completo: save(), findById(), findAll(), deleteById(), etc.
}
