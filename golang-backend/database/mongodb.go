package database

import (
	"context"
	"log"
	"os"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// Client adalah instance global MongoDB
var Client *mongo.Client

// ConnectMongo menghubungkan ke MongoDB dan mengembalikan client
func ConnectMongo() *mongo.Client {
	mongoURI := os.Getenv("MONGO_URI")
	if mongoURI == "" {
		log.Fatal("MONGO_URI is not set in environment")
	}
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	client, err := mongo.Connect(ctx, options.Client().ApplyURI(mongoURI))
	if err != nil {
		log.Fatalf("Failed to connect to MongoDB: %v", err)
	}
	// Ping untuk memastikan koneksi
	err = client.Ping(ctx, nil)
	if err != nil {
		log.Fatalf("Failed to ping MongoDB: %v", err)
	}
	log.Println("Connected to MongoDB!")
	Client = client
	return client
}

// GetCollection mengembalikan collection dari database tertentu
func GetCollection(database, collection string) *mongo.Collection {
	return Client.Database(database).Collection(collection)
}
