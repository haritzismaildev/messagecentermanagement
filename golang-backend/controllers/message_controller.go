package controllers

import (
	"context"
	"encoding/json"
	"net/http"
	"os"
	"time"

	"whatsapp-center-backend/database"
	"whatsapp-center-backend/models"
	"whatsapp-center-backend/rabbitmq"

	"github.com/gin-gonic/gin"
	"github.com/twilio/twilio-go"
	openapi "github.com/twilio/twilio-go/rest/api/v2010"
)

// SendMessageRequest untuk satu pesan
type SendMessageRequest struct {
	To   string `json:"to" binding:"required"`
	Body string `json:"body" binding:"required"`
}

// BulkMessageRequest untuk pesan massal
type BulkMessageRequest struct {
	Messages []SendMessageRequest `json:"messages" binding:"required"`
}

// SendMessage mengirim pesan tunggal melalui Twilio
// @Summary Send a single message
// @Description Send a WhatsApp message to a specific number.
// @Tags Message
// @Accept json
// @Produce json
// @Param message body SendMessageRequest true "Message data"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Router /api/message/send [post]
func SendMessage(c *gin.Context) {
	var req SendMessageRequest
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
	params.SetTo("whatsapp:" + req.To)
	params.SetFrom("whatsapp:+14155238886") // nomor Twilio sandbox atau yang terdaftar
	params.SetBody(req.Body)

	resp, err := client.Api.CreateMessage(params)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"msg": "Failed to send message", "error": err.Error()})
		return
	}

	// Buat model Message dan catat log (di sini hanya contoh, idealnya simpan ke database)
	// messageLog := models.Message{
	// 	ID:        *resp.Sid,
	// 	To:        req.To,
	// 	Body:      req.Body,
	// 	Direction: "outbound",
	// 	Status:    "sent", // atau status sesuai respon Twilio
	// 	CreatedAt: time.Now(),
	// 	UpdatedAt: time.Now(),
	// }

	// Buat data Message untuk disimpan di MongoDB
	messageData := models.Message{
		ID:        *resp.Sid,
		Sender:    "admin-system", // atau nomor pengirim lainnya jika diperlukan
		Recipient: req.To,
		Body:      req.Body,
		Type:      "send",
		Status:    "sent", // atau update sesuai dengan respon Twilio
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	// Simpan ke MongoDB
	collection := database.GetCollection("whatsappDB", "messages")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err = collection.InsertOne(ctx, messageData)
	if err != nil {
		// Jika gagal simpan, log saja, tapi tetap kirim respons sukses untuk pengiriman pesan
		c.JSON(http.StatusInternalServerError, gin.H{"msg": "Message sent but failed to log transaction", "error": err.Error()})
		return
	}

	// Publikasikan event ke RabbitMQ (misal queue "message.sent")
	// eventData, _ := json.Marshal(messageLog)
	eventData, _ := json.Marshal(messageData)
	_ = rabbitmq.PublishMessage("message.sent", eventData)
	if err := rabbitmq.PublishMessage("message.sent", eventData); err != nil {
		// Log error tetapi tetap kirim respons sukses
	}

	c.JSON(http.StatusOK, gin.H{"msg": "Message sent", "sid": *resp.Sid})
}

// BulkMessaging mengirim pesan ke banyak penerima
// @Summary Bulk Messaging
// @Description Send multiple WhatsApp messages in a single request.
// @Tags Message
// @Accept json
// @Produce json
// @Param messages body BulkMessageRequest true "Bulk message data"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Router /api/message/bulk [post]
func BulkMessaging(c *gin.Context) {
	var req struct {
		Messages []SendMessageRequest `json:"messages" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"msg": "Invalid request", "error": err.Error()})
		return
	}

	var results []gin.H
	accountSid := os.Getenv("TWILIO_ACCOUNT_SID")
	authToken := os.Getenv("TWILIO_AUTH_TOKEN")
	client := twilio.NewRestClientWithParams(twilio.ClientParams{
		Username: accountSid,
		Password: authToken,
	})

	collection := database.GetCollection("whatsappDB", "messages")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	for _, m := range req.Messages {
		params := &openapi.CreateMessageParams{}
		params.SetTo("whatsapp:" + m.To)
		params.SetFrom("whatsapp:+14155238886")
		params.SetBody(m.Body)

		resp, err := client.Api.CreateMessage(params)
		if err != nil {
			results = append(results, gin.H{"to": m.To, "error": err.Error()})
			continue
		}

		// Buat data Message
		messageData := models.Message{
			ID:        *resp.Sid,
			Sender:    "admin-system",
			Recipient: m.To,
			Body:      m.Body,
			Type:      "bulk",
			Status:    "sent",
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		}

		// Simpan data ke MongoDB
		_, err = collection.InsertOne(ctx, messageData)
		if err != nil {
			results = append(results, gin.H{"to": m.To, "error": err.Error()})
			continue
		}

		// Publikasikan event ke RabbitMQ
		eventData, _ := json.Marshal(messageData)
		_ = rabbitmq.PublishMessage("message.sent", eventData)

		results = append(results, gin.H{"to": m.To, "sid": *resp.Sid})
	}

	c.JSON(http.StatusOK, gin.H{"results": results})
}

// UpdateMessageRequest adalah struktur request untuk update message
type UpdateMessageRequest struct {
	Body string `json:"body" binding:"required"`
}

// UpdateMessage updates an existing message.
// @Summary Update a message
// @Description Update message details by ID.
// @Tags Message
// @Accept json
// @Produce json
// @Param id path string true "Message ID"
// @Param message body UpdateMessageRequest true "Update message payload"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Router /message/{id} [put]
func UpdateMessage(c *gin.Context) {
	id := c.Param("id")
	var updateReq UpdateMessageRequest
	if err := c.ShouldBindJSON(&updateReq); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"msg": "Invalid request", "error": err.Error()})
		return
	}

	// Contoh: Simulasi update (di produksi, update data di database)
	updatedMessage := models.Message{
		ID:        id,
		Body:      updateReq.Body,
		UpdatedAt: time.Now(),
	}

	// Balas dengan data updated (simulasi)
	c.JSON(http.StatusOK, gin.H{"msg": "Message updated successfully", "message": updatedMessage})
}

// DeleteMessage deletes a message by its ID.
// @Summary Delete a message
// @Description Delete a message by ID.
// @Tags Message
// @Accept json
// @Produce json
// @Param id path string true "Message ID"
// @Success 200 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Router /message/{id} [delete]
func DeleteMessage(c *gin.Context) {
	id := c.Param("id")
	// Contoh: Simulasi penghapusan pesan (di produksi, lakukan operasi delete di database)
	c.JSON(http.StatusOK, gin.H{"msg": "Message deleted successfully", "id": id})
}
