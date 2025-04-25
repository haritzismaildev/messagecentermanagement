package rabbitmq

import (
	"log"

	"github.com/streadway/amqp"
)

// Connection instance global (atau gunakan singleton)
var RabbitConn *amqp.Connection

// InnitWabbitMQ menginisialisasi koneksi RabbitMQ
func InitRabbitMQ() (*amqp.Connection, error) {
	connstr := "amqp://guest:guest@localhost:5672" // bisa juga diambil dari env
	conn, err := amqp.Dial(connstr)
	if err != nil {
		return nil, err
	}
	RabbitConn = conn
	log.Println("Connected to RabbitMQ")
	return conn, nil
}

func PublishMessage(queueName string, message []byte) error {
	channel, err := RabbitConn.Channel()
	if err != nil {
		return err
	}
	defer channel.Close()

	// Deklarasikan Queue
	_, err = channel.QueueDeclare(
		queueName, // name
		true,      // durable
		false,     // autoDelete
		false,     // exclusive
		false,     //noWait
		nil,       // args
	)
	if err != nil {
		return err
	}

	err = channel.Publish(
		"",        //exchange
		queueName, // routing key
		false,     // mandatory
		false,     // immediate
		amqp.Publishing{
			ContentType: "application/json",
			Body:        message,
		})
	return err
}
