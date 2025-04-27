import React, { useState, useEffect, useRef } from 'react';
import EmojiPicker from 'emoji-picker-react'; // Pastikan install library ini: npm install emoji-picker-react
import './ChatWindow.css';

const ChatWindow = ({ messages, onSendMessage, onSendFile }) => {
  const [inputText, setInputText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Scroll ke bottom setiap kali pesan berubah
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleEmojiClick = (event, emojiObject) => {
    setInputText(inputText + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (inputText.trim() === '') return;
    onSendMessage(inputText);
    setInputText('');
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      onSendFile(file);
    }
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        <h3>Chat with Client</h3>
      </div>
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`chat-bubble ${msg.sender === 'me' ? 'sent' : 'received'}`}
          >
            {msg.type === 'file' ? (
              <div className="file-message">
                <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer">
                  {msg.fileName}
                </a>
              </div>
            ) : (
              <p>{msg.body}</p>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="chat-input">
        <form onSubmit={handleSend}>
          <input
            type="text"
            placeholder="Type your message..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
            😊
          </button>
          <button type="button" onClick={() => fileInputRef.current.click()}>
            📎
          </button>
          <button type="submit">Send</button>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
        </form>
        {showEmojiPicker && (
          <div className="emoji-picker-container">
            <EmojiPicker onEmojiClick={handleEmojiClick} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatWindow;