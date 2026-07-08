package models

import (
	"time"
)

type Task struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Title       string    `gorm:"not null;type:varchar(150)" json:"title"`
	Description string    `gorm:"type:text" json:"description"`
	Completed   bool      `gorm:"default:false" json:"completed"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

type CreateTaskDTO struct {
	Title       string `json:"title" validate:"required,min=1,max=150"`
	Description string `json:"description" validate:"max=1000"`
}

type UpdateTaskDTO struct {
	Title       *string `json:"title" validate:"omitempty,min=1,max=150"`
	Description *string `json:"description" validate:"omitempty,max=1000"`
	Completed   *bool   `json:"completed"`
}
