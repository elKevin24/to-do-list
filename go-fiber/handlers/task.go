package handlers

import (
	"strings"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"todo-go-fiber/database"
	"todo-go-fiber/models"
)

var validate = validator.New()

func FormatValidationErrors(err error) fiber.Map {
	errors := make(map[string]string)
	if validationErrors, ok := err.(validator.ValidationErrors); ok {
		for _, e := range validationErrors {
			field := strings.ToLower(e.Field()[:1]) + e.Field()[1:]
			errors[field] = "Validation failed on tag: " + e.Tag()
		}
	}
	return fiber.Map{"validationErrors": errors}
}

func GetTasks(c *fiber.Ctx) error {
	var tasks []models.Task
	database.DB.Order("id asc").Find(&tasks)
	return c.JSON(tasks)
}

func GetTask(c *fiber.Ctx) error {
	id := c.Params("id")
	var task models.Task
	if err := database.DB.First(&task, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Task not found"})
	}
	return c.JSON(task)
}

func CreateTask(c *fiber.Ctx) error {
	var dto models.CreateTaskDTO
	if err := c.BodyParser(&dto); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}

	if err := validate.Struct(&dto); err != nil {
		return c.Status(400).JSON(FormatValidationErrors(err))
	}

	task := models.Task{
		Title:       dto.Title,
		Description: dto.Description,
		Completed:   false,
	}

	database.DB.Create(&task)
	return c.Status(201).JSON(task)
}

func UpdateTask(c *fiber.Ctx) error {
	id := c.Params("id")
	var task models.Task
	if err := database.DB.First(&task, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Task not found"})
	}

	var dto models.UpdateTaskDTO
	if err := c.BodyParser(&dto); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}

	if err := validate.Struct(&dto); err != nil {
		return c.Status(400).JSON(FormatValidationErrors(err))
	}

	if dto.Title != nil {
		task.Title = *dto.Title
	}
	if dto.Description != nil {
		task.Description = *dto.Description
	}
	if dto.Completed != nil {
		task.Completed = *dto.Completed
	}

	database.DB.Save(&task)
	return c.JSON(task)
}

func DeleteTask(c *fiber.Ctx) error {
	id := c.Params("id")
	var task models.Task
	if err := database.DB.First(&task, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Task not found"})
	}

	database.DB.Delete(&task)
	return c.SendStatus(204)
}
