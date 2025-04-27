import React, { useState } from 'react';
// import { sendMessage } from '../services/twilioService';
import { sendTwilioMessage } from '../services/twilioService';


const SendTwilioMessage = () => {
  const [recipient, setRecipient] = useState('');
  const [body, setBody] = useState('');

  const handleSend = async (e) => {
    e.preventDefault();
    try {
      // const data = await sendMessage({ to: recipient, body });
      const data = await sendTwilioMessage({ to: recipient, body });
      alert(`Message sent! SID: ${data.sid}`);
    } catch (error) {
      alert('Send message failed: ' + (error.msg || 'Unknown error'));
    }
  };

  return (
    <div>
      <h2>Send Message</h2>
      <form onSubmit={handleSend}>
        <label>Recipient:</label>
        <input
          type="text"
          value={recipient}
          onChange={e => setRecipient(e.target.value)}
          placeholder="e.g., +6281234567890"
          required
        />
        <label>Message:</label>
        <textarea
          value={body}
          onChange={e => setBody(e.target.value)}
          required
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default SendTwilioMessage;
