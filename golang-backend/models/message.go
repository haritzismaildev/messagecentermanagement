package models

import "time"

// Message mewakili pesan WhatsApp yang dikirim melalui Twilio
type Message struct {
	// ID        string    `json:"id"` // bisa di-generate dari database (misalnya UUID)
	// To        string    `json:"to"`
	// Body      string    `json:"body"`
	// Direction string    `json:"direction"` // "outbound" atau "inbound"
	// Status    string    `json:"status"`    // misal: sent, delivered, failed
	// CreatedAt time.Time `json:"created_at"`
	// UpdatedAt time.Time `json:"updated_at"`
	ID        string    `bson:"_id,omitempty" json:"id"`
	Sender    string    `bson:"sender" json:"sender"`       // Misalnya, nomor pengirim (bisa "admin-system" atau nomor tertentu)
	Recipient string    `bson:"recipient" json:"recipient"` // Nomor tujuan
	Body      string    `bson:"body" json:"body"`           // Isi pesan
	Type      string    `bson:"type" json:"type"`           // "send" atau "bulk"
	Status    string    `bson:"status" json:"status"`       // Status pengiriman (misal: sent, delivered, failed)
	CreatedAt time.Time `bson:"created_at" json:"created_at"`
	UpdatedAt time.Time `bson:"updated_at" json:"updated_at"`
}
