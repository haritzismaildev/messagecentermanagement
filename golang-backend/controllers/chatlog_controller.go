package controllers

import (
	"context"
	"net/http"
	"time"

	"whatsapp-center-backend/database"
	"whatsapp-center-backend/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/bson"
)

// In-memory store untuk chat logs
var chatLogs []models.ChatLog

// CreateChatLog menambahkan log chat baru
func CreateChatLog(c *gin.Context) {
	var logEntry models.ChatLog
	if err := c.ShouldBindJSON(&logEntry); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"msg": "Invalid request", "error": err.Error()})
		return
	}
	logEntry.ID = uuid.NewString()
	logEntry.Timestamp = time.Now()

	// chatLogs = append(chatLogs, logEntry)
	// c.JSON(http.StatusOK, logEntry)

	// Dapatkan collection "chatlogs" pada database "whatsappDB"
	coll := database.GetCollection("whatsappDB", "chatlogs")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := coll.InsertOne(ctx, logEntry)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"msg": "Failed to insert chat log", "error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, logEntry)

}

// GetChatLogs mengembalikan semua log chat
func GetChatLogs(c *gin.Context) {
	//c.JSON(http.StatusOK, chatLogs)

	coll := database.GetCollection("whatsappDB", "chatlogs")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	cursor, err := coll.Find(ctx, bson.M{})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"msg": "Failed to fetch chat logs", "error": err.Error()})
		return
	}
	defer cursor.Close(ctx)

	var logs []models.ChatLog
	if err = cursor.All(ctx, &logs); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"msg": "Error decoding chat logs", "error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, logs)
}
