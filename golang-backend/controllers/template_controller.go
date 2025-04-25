package controllers

import (
	"net/http"
	"time"

	"whatsapp-center-backend/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// In-memory store untuk template (untuk contoh; gunakan database nyata di produksi)
var templates = make(map[string]models.Template)

// CreateTemplate membuat template pesan
func CreateTemplate(c *gin.Context) {
	var tmpl models.Template
	if err := c.ShouldBindJSON(&tmpl); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"msg": "Invalid request", "error": err.Error()})
		return
	}
	tmpl.ID = uuid.NewString()
	tmpl.CreatedAt = time.Now()
	tmpl.UpdatedAt = time.Now()
	templates[tmpl.ID] = tmpl
	c.JSON(http.StatusOK, tmpl)
}

// GetTemplates mengembalikan daftar template
func GetTemplates(c *gin.Context) {
	var list []models.Template
	for _, tmpl := range templates {
		list = append(list, tmpl)
	}
	c.JSON(http.StatusOK, list)
}

// UpdateTemplate memperbarui template
func UpdateTemplate(c *gin.Context) {
	id := c.Param("id")
	tmpl, exists := templates[id]
	if !exists {
		c.JSON(http.StatusNotFound, gin.H{"msg": "Template not found"})
		return
	}
	var update models.Template
	if err := c.ShouldBindJSON(&update); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"msg": "Invalid request", "error": err.Error()})
		return
	}
	tmpl.Name = update.Name
	tmpl.Content = update.Content
	tmpl.UpdatedAt = time.Now()
	templates[id] = tmpl
	c.JSON(http.StatusOK, tmpl)
}

// DeleteTemplate menghapus template
func DeleteTemplate(c *gin.Context) {
	id := c.Param("id")
	if _, exists := templates[id]; !exists {
		c.JSON(http.StatusNotFound, gin.H{"msg": "Template not found"})
		return
	}
	delete(templates, id)
	c.JSON(http.StatusOK, gin.H{"msg": "Template deleted"})
}
