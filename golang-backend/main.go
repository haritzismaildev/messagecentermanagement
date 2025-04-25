package main

import (
	"crypto/aes"
	"crypto/cipher"
	"encoding/base64"
	"flag"
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"time"

	"whatsapp-center-backend/database"
	"whatsapp-center-backend/rabbitmq"
	"whatsapp-center-backend/routes"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"

	// Tambahkan import untuk Swagger UI:
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"

	// Jika Anda menggunakan swaggo untuk generate docs, pastikan untuk mengimpor docs:
	_ "whatsapp-center-backend/docs"
)

func decryptEnvFile(encPath, key string) ([]byte, error) {
	encrypted, err := ioutil.ReadFile(encPath)
	if err != nil {
		return nil, err
	}
	ciphertext, err := base64.StdEncoding.DecodeString(string(encrypted))
	if err != nil {
		return nil, err
	}
	block, err := aes.NewCipher([]byte(key))
	if err != nil {
		return nil, err
	}
	iv := ciphertext[:aes.BlockSize] // Panic if ciphertext length < 16
	data := ciphertext[aes.BlockSize:]
	stream := cipher.NewCFBDecrypter(block, iv)
	stream.XORKeyStream(data, data)
	return data, nil
}

func main() {
	// Flag untuk port
	portFlag := flag.String("port", "", "Port for the server to listen on")
	flag.Parse()

	// Muat environment variables dari .env
	err := godotenv.Load(".env")
	if err != nil {
		log.Fatal("Error loading .env file:", err)
	}

	// Panggil ConnectMongo untuk menginisialisasi koneksi MongoDB
	database.ConnectMongo()

	// Baca port dari environment atau gunakan flag jika diberikan
	port := os.Getenv("PORT")
	if *portFlag != "" {
		port = *portFlag
	}
	if port == "" {
		port = "3881" // default port
	}

	// Inisialisasi RabbitMQ
	rabbitConn, err := rabbitmq.InitRabbitMQ()
	if err != nil {
		log.Fatalf("Failed to initialize RabbitMQ: %v", err)
	}
	defer rabbitConn.Close()

	// Inisialisasi Gin Engine
	gin.SetMode(gin.ReleaseMode)
	router := gin.Default()
	router.Use(gin.Recovery())

	// Tambahkan middleware CORS
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"}, // Atur sesuai kebutuhan, misalnya, ["http://localhost:3000"]
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization", "x-final-auth"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	router.Static("/public", "./public")

	// // Dapatkan path Swagger UI
	// swaggerUIDir := os.Getenv("SWAGGER_UI_DIR")
	// if swaggerUIDir == "" {
	// 	log.Fatal("SWAGGER_UI_DIR is not set in environment")
	// }
	// absSwaggerUIDir, err := filepath.Abs(swaggerUIDir)
	// if err != nil {
	// 	log.Fatalf("Failed to get absolute path: %v", err)
	// }
	// log.Printf("Serving Swagger UI from: %s", absSwaggerUIDir)

	// router.Static("/swagger-ui", absSwaggerUIDir)
	// router.GET("/swagger", func(c *gin.Context) {
	// 	c.Redirect(302, "/swagger-ui/index.html")
	// })

	// Daftarkan rute API yang lain
	routes.RegisterRoutes(router)

	// Daftarkan rute untuk Swagger UI
	// Akses via: http://localhost:<port>/swagger/index.html
	router.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	fmt.Printf("Server will run on port: %s\n", port)
	if err := router.Run(":" + port); err != nil {
		log.Fatal("Failed to run server: ", err)
	}
}
