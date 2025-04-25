package routes

import (
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"whatsapp-center-backend/controllers"
	"whatsapp-center-backend/middleware"

	"github.com/gin-gonic/gin"
	"github.com/twilio/twilio-go"
	openapi "github.com/twilio/twilio-go/rest/api/v2010"
)

// sendTwilioMessageRequest mewakili JSON request body
type sendTwilioMessageRequest struct {
	To   string `json:"to" example:"+6281234567890"`
	Body string `json:"body" example:"Hello from test"`
}

// sendTwilioMessageResponse mewakili JSON response saat berhasil
type sendTwilioMessageResponse struct {
	Msg string `json:"msg" example:"Message sent successfully"`
	SID string `json:"sid" example:"SMxxxxxxxxxxxxxx"`
}

// sendTwilioMessageError mewakili response saat terjadi error
type sendTwilioMessageError struct {
	Msg   string `json:"msg" example:"Failed to send message"`
	Error string `json:"error,omitempty" example:"some error detail"`
}

// inboundMessage contoh payload data inbound (jika perlu)
type inboundMessage struct {
	From string `json:"from" example:"whatsapp:+6281234567890"`
	Body string `json:"body" example:"Hello from client"`
}

// inboundMessageError contoh struct error untuk GET inbound
type inboundMessageError struct {
	Error string `json:"error" example:"Failed to get messages from Node"`
}

func RegisterRoutes(r *gin.Engine) {
	// Public routes
	api := r.Group("/api")
	{
		// Endpoint untuk pesan
		api.POST("/message/send", controllers.SendMessage)   // Send single message
		api.POST("/message/bulk", controllers.BulkMessaging) // Bulk messaging

		// Chat logs endpoints
		api.POST("/chatlog", controllers.CreateChatLog)
		api.GET("/chatlog", controllers.GetChatLogs)

		// Endpoint untuk conversation (2 arah)
		api.POST("/conversation/send", controllers.SendConversationMessage)
		api.GET("/conversation", controllers.GetConversation)

		// Route untuk menerima pesan masuk (webhook dari Twilio)
		api.POST("/twilio-webhook", controllers.InboundMessageWebhook)

		// route GET baru untuk ambil pesan
		api.GET("/twilio-webhook/messages", getInboundMessages)

		// Rute POST untuk mengirim pesan Twilio
		api.POST("/send-twilio-message", handleSendTwilioMessage)
	}

	// Protected routes: contoh jika ingin membatasi dengan middleware JWT
	protected := r.Group("/api")
	protected.Use(middleware.AuthMiddleware())
	{
		// Contoh: Endpoint untuk Update Message dan Delete Message
		protected.PUT("/message/:id", controllers.UpdateMessage)
		protected.DELETE("/message/:id", controllers.DeleteMessage)
	}
}

func getInboundMessages(c *gin.Context) {
	resp, err := http.Get("http://localhost:3881/api/chatlogs")
	if err != nil {
		log.Println("Error call node", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get messages from Node"})
		return
	}
	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		log.Println("Error read body:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read response"})
		return
	}
	c.Data(http.StatusOK, "application/json", body)
}

func handleSendTwilioMessage(c *gin.Context) {
	var req struct {
		To   string `json:"to"`
		Body string `json:"body"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"msg": "Invalid JSON request"})
		return
	}

	sid, err := sendWhatsAppMessage(req.To, req.Body)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"msg": "Failed to send message", "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"msg": "Message sent successfully",
		"sid": sid,
	})
}

// sendWhatsAppMessage memanggil Twilio API untuk mengirim pesan WhatsApp.
func sendWhatsAppMessage(to, body string) (string, error) {
	// Ambil SID dan Auth Token dari environment variable
	accountSid := os.Getenv("TWILIO_ACCOUNT_SID")
	authToken := os.Getenv("TWILIO_AUTH_TOKEN")

	if accountSid == "" || authToken == "" {
		return "", fmt.Errorf("TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN not set in environment")
	}

	// Buat client Twilio
	client := twilio.NewRestClientWithParams(twilio.ClientParams{
		Username: accountSid,
		Password: authToken,
	})

	// Siapkan parameter pengiriman pesan
	params := &openapi.CreateMessageParams{}
	// Format nomor: "whatsapp:+62..."
	params.SetTo("whatsapp:" + to)
	// Nomor pengirim dari Twilio Sandbox
	// Ganti +14155238886 dengan nomor sandbox Anda
	params.SetFrom("whatsapp:+14155238886")
	params.SetBody(body)

	// Panggil Twilio API
	// resp, err := client.ApiV2010.CreateMessage(params)
	resp, err := client.Api.CreateMessage(params)
	if err != nil {
		return "", fmt.Errorf("error calling Twilio API: %w", err)
	}

	// Periksa SID respons
	if resp.Sid == nil {
		return "", fmt.Errorf("Twilio response has no SID")
	}

	return *resp.Sid, nil
}
