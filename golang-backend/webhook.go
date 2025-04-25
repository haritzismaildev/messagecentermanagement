package main

import (
	"context"
	"log"
	"net/http"
	"time"

	"whatsapp-center-backend/database"
	"whatsapp-center-backend/models"

	"github.com/gin-gonic/gin"
)

func RegisterWebhookRoutes(r *gin.Engine) {
	r.POST("/twilio-webhook", func(c *gin.Context) {
		// Twilio akan POST data Body=..., From=..., dsb.
		log.Println("Webhook endpoint hit")
		body := c.PostForm("Body")
		from := c.PostForm("From")
		log.Printf("Incoming from %s: %s\n", from, body)

		// Mungkin publish ke Node.js?
		// dsb.

		// Buat objek chatLog (pastikan struktur sudah benar)
		chatLog := models.ChatLog{
			From:      from,
			To:        "", // Jika perlu, set nomor Twilio atau kosong
			Body:      body,
			Direction: "inbound",
			Timestamp: time.Now(),
			DeviceIP:  c.Request.RemoteAddr, // catat alamat IP client
		}

		// Simpan ke MongoDB
		collection := database.GetCollection("whatsappDB", "chatlogs")
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()

		result, err := collection.InsertOne(ctx, chatLog)
		if err != nil {
			log.Printf("Failed to insert chat log: %v", err)
			c.String(http.StatusInternalServerError, "Failed to log message")
			return
		}
		log.Printf("Inserted chat log with ID: %v", result.InsertedID)

		c.String(http.StatusOK, "OK")
	})
}
