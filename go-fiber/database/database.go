package database

import (
	"log"

	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
	"todo-go-fiber/models"
)

var DB *gorm.DB

func ConnectDB() {
	db, err := gorm.Open(sqlite.Open("todo-go.sqlite"), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database. \n", err)
	}

	log.Println("Connected to Database")
	db.AutoMigrate(&models.Task{})
	DB = db
}
