package main

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/base64"
	"fmt"
	"io"
	"io/ioutil"
	"log"
)

// Ganti 'my16byteSecret!!' dengan kunci 16 byte pas
var key = []byte("my16byteSecret!!") // 16 byte

func main() {
	// 1) Baca isi .env
	plaintext, err := ioutil.ReadFile(".env")
	if err != nil {
		log.Fatal("Failed to read .env:", err)
	}

	// 2) Siapkan cipher AES
	block, err := aes.NewCipher(key)
	if err != nil {
		log.Fatal("Failed creating AES cipher:", err)
	}

	// 3) Buat IV random 16 byte
	iv := make([]byte, aes.BlockSize)
	_, err = io.ReadFull(rand.Reader, iv)
	if err != nil {
		log.Fatal("Failed generating IV:", err)
	}

	// 4) Enkripsi dengan mode CFB
	stream := cipher.NewCFBEncrypter(block, iv)
	ciphertext := make([]byte, len(plaintext))
	stream.XORKeyStream(ciphertext, plaintext)

	// 5) Gabung IV + ciphertext
	final := append(iv, ciphertext...)

	// 6) Base64-encode
	encoded := base64.StdEncoding.EncodeToString(final)

	// 7) Tulis ke .env.enc
	err = ioutil.WriteFile(".env.enc", []byte(encoded), 0600)
	if err != nil {
		log.Fatal("Failed writing .env.enc:", err)
	}

	fmt.Println("Encryption done. .env.enc created.")
}
