package controllers

import (
	"context"
	"encoding/json"
	"net/http"
	"os"
	"sort"
	"time"

	"whatsapp-center-backend/database"
	"whatsapp-center-backend/models"
	"whatsapp-center-backend/rabbitmq"

	"github.com/gin-gonic/gin"
	"github.com/twilio/twilio-go"
	openapi "github.com/twilio/twilio-go/rest/api/v2010"
	"go.mongodb.org/mongo-driver/bson"
)

// ConversationSendRequest adalah struktur request untuk mengirim pesan melalui endpoint conversation
type ConversationSendRequest struct {
	Contact string `json:"contact" binding:"required"` // Nomor WhatsApp client (contoh: +6281234567890)
	Body    string `json:"body" binding:"required"`
}

// SendConversationMessage mengirim pesan ke client dan mencatat transaksi di MongoDB
// @Summary Send a conversation message
// @Description Send a WhatsApp message to a client and log the transaction in the chatlogs collection.
// @Tags Conversation
// @Accept json
// @Produce json
// @Param message body ConversationSendRequest true "Message data"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Router /api/conversation/send [post]
func SendConversationMessage(c *gin.Context) {
	var req ConversationSendRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"msg": "Invalid request", "error": err.Error()})
		return
	}

	// Inisialisasi Twilio client
	accountSid := os.Getenv("TWILIO_ACCOUNT_SID")
	authToken := os.Getenv("TWILIO_AUTH_TOKEN")
	client := twilio.NewRestClientWithParams(twilio.ClientParams{
		Username: accountSid,
		Password: authToken,
	})

	params := &openapi.CreateMessageParams{}
	params.SetTo("whatsapp:" + req.Contact)
	params.SetFrom("whatsapp:+14155238886") // Sesuaikan dengan nomor Twilio
	params.SetBody(req.Body)

	resp, err := client.Api.CreateMessage(params)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"msg": "Failed to send message", "error": err.Error()})
		return
	}

	// Buat record untuk chat log
	messageData := models.ChatLog{
		ID:        *resp.Sid,
		From:      "admin-system", // Pesan dikirim dari sistem (atau masukkan user ID jika diperlukan)
		To:        req.Contact,
		Body:      req.Body,
		Direction: "outbound",
		Timestamp: time.Now(),
		DeviceIP:  c.ClientIP(), // Menggunakan metode Gin untuk mendapatkan IP client, bila relevan
	}

	// Simpan ke MongoDB collection "chatlogs" di database "whatsappDB"
	collection := database.GetCollection("whatsappDB", "chatlogs")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	_, err = collection.InsertOne(ctx, messageData)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"msg": "Message sent but failed to log transaction", "error": err.Error()})
		return
	}

	// Publikasikan event ke RabbitMQ (misalnya, untuk monitoring)
	eventData, _ := json.Marshal(messageData)
	_ = rabbitmq.PublishMessage("conversation.message.sent", eventData)

	c.JSON(http.StatusOK, gin.H{"msg": "Message sent and logged", "sid": *resp.Sid})
}

// GetConversation retrieves conversation history for a given contact
// @Summary Get conversation history
// @Description Retrieve all chat log messages for a given contact.
// @Tags Conversation
// @Accept json
// @Produce json
// @Param contact query string true "Contact phone number (e.g., +6281234567890)"
// @Success 200 {array} models.ChatLog
// @Failure 400 {object} map[string]interface{}
// @Router /api/conversation [get]
func GetConversation(c *gin.Context) {
	contact := c.Query("contact")
	if contact == "" {
		c.JSON(http.StatusBadRequest, gin.H{"msg": "Contact parameter is required"})
		return
	}

	collection := database.GetCollection("whatsappDB", "chatlogs")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Cari semua pesan di mana either From atau To sama dengan contact.
	filter := bson.M{
		"$or": []bson.M{
			{"from": contact},
			{"recipient": contact},
		},
	}

	cursor, err := collection.Find(ctx, filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"msg": "Failed to fetch conversation", "error": err.Error()})
		return
	}
	defer cursor.Close(ctx)

	var messages []models.ChatLog
	if err = cursor.All(ctx, &messages); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"msg": "Error decoding conversation", "error": err.Error()})
		return
	}

	// Urutkan pesan berdasarkan waktu pengiriman (ascending)
	sort.Slice(messages, func(i, j int) bool {
		return messages[i].Timestamp.Before(messages[j].Timestamp)
	})

	c.JSON(http.StatusOK, messages)
}
