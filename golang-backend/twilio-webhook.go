package main

import (
	"net/http"
	"net/url"

	"github.com/gin-gonic/gin"
)

func twiliowebhook(r *gin.Engine) {
	r.POST("/twilio-webhook", func(c *gin.Context) {
		from := c.PostForm("From") // whatsapp:+628xxxx
		body := c.PostForm("Body")
		// DSN: inbound

		// kirim data ke node.js
		// misal call node endpoint http://nodehost:3881/receive-webhook
		// _, err := http.PostForm("http://nodehost:3881/receive-webhook", url.Values{
		_, err := http.PostForm("http://localhost:3881/receive-webhook", url.Values{
			"from": {from},
			"body": {body},
		})
		if err != nil {
			// untuk handle error
		}

		c.String(http.StatusOK, "OK")
	})
}
