package models

import "time"

// ChatLog menyimpan log percakapan masuk dan keluar
type ChatLog struct {
	ID        string    `bson:"_id,omitempty" json:"id"`
	From      string    `bson:"from" json:"from"`
	To        string    `bson:"to" json:"to"`               // Nomor yang menerima pesan (misalnya, nomor Twilio)
	Body      string    `bson:"body" json:"body"`           // Isi pesan
	Direction string    `bson:"direction" json:"direction"` // "inbound" atau "outbound"
	Timestamp time.Time `bson:"timestamp" json:"timestamp"`
	DeviceIP  string    `bson:"device_ip" json:"device_ip"` // Alamat IP perangkat pengirim
}
