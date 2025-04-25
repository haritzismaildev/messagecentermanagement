package main

import (
	"log"

	"github.com/streadway/amqp"
)

func main() {
	conn, err := amqp.Dial("amqp://guest:guest@localhost:5672")
	if err != nil {
		log.Fatalf("Failed to connect to RabbitMQ: %v", err)
	}
	defer conn.Close()

	ch, err := conn.Channel()
	if err != nil {
		log.Fatalf("Failed to open a channel: %v", err)
	}
	defer ch.Close()

	Queue := "message.sent" // coba ganti dengan nama queue yang kita gunakan

	msgs, err := ch.Consume(
		Queue, // queue
		"",    //consumer
		true,  // auto-acknowledge
		false, //exclusive
		false, //no-local
		false, // no-wait
		nil,   //args
	)
	if err != nil {
		log.Fatalf("Failed to register a consumer: %v", err)
	}

	log.Printf("Waiting for messages in queue %s. To exit press CTRL+C", Queue)

	forever := make(chan bool)
	go func() {
		for d := range msgs {
			log.Printf("Received a message: %s", d.Body)
		}
	}()

	<-forever
}
