package controllers

import (
	"context"
	"log"
	"net/http"
	"time"

	"whatsapp-center-backend/database"
	"whatsapp-center-backend/models"

	"github.com/gin-gonic/gin"
)

// InboundMessageWebhook menerima pesan masuk dari Twilio (reply) dan “menyimpannya ke MongoDB
//
// @Summary Inbound WhatsApp Message Webhook
// @Description Receives an inbound WhatsApp message from Twilio and logs the message details (sender, body, timestamp, device IP) into MongoDB.
// @Tags Webhook
// @Accept multipart/form-data
// @Produce json
// @Param From formData string true "Sender's WhatsApp number (e.g., whatsapp:+628xxxxxxx)"
// @Param Body formData string true "Message body"
// @Success 200 {string} string "OK"
// @Failure 400 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /api/twilio-webhook [post]
func InboundMessageWebhook(c *gin.Context) {
	// Log bahwa endpoint dipanggil
	log.Println("Webhook endpoint hit")

	// Twilio biasanya mengirimkan parameter melalui form-data.
	from := c.PostForm("From") // Format: "whatsapp:+628xxxxxx"
	body := c.PostForm("Body")
	// Jika tersedia, Anda juga dapat mendapatkan parameter lain (misalnya, MediaUrl, dsb.)

	// // Dapatkan alamat IP request sebagai gambaran device (opsional)
	// remoteAddr := c.Request.RemoteAddr

	// Validasi input
	if from == "" || body == "" {
		c.JSON(http.StatusBadRequest, gin.H{"msg": "Missing parameters"})
		return
	}

	// Ambil alamat IP client (bisa berupa "IP:port")
	remoteAddr := c.Request.RemoteAddr

	// Buat objek ChatLog
	chatLog := models.ChatLog{
		From:      from,
		To:        "", // Bisa diisi dengan nomor Twilio atau dibiarkan kosong jika tidak perlu
		Body:      body,
		Direction: "inbound",
		Timestamp: time.Now(),
		DeviceIP:  remoteAddr,
	}

	// Simpan ke MongoDB di collection "chatlogs" pada database "whatsappDB"
	collection := database.GetCollection("whatsappDB", "chatlogs")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// _, err := collection.InsertOne(ctx, chatLog)
	// if err != nil {
	// 	c.JSON(http.StatusInternalServerError, gin.H{"msg": "Failed to log message", "error": err.Error()})
	// 	return
	// }
	result, err := collection.InsertOne(ctx, chatLog)
	if err != nil {
		log.Printf("Failed to insert chat log: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"msg": "Failed to log message", "error": err.Error()})
		return
	}
	log.Printf("Inserted chat log with ID: %v", result.InsertedID)

	// Opsional: Publikasikan event ke RabbitMQ jika diperlukan.
	// eventData, _ := json.Marshal(chatLog)
	// _ = rabbitmq.PublishMessage("chatlog.inbound", eventData)

	c.JSON(http.StatusOK, gin.H{"msg": "Message received"})
}
