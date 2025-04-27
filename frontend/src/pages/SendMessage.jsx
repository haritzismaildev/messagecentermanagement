import React, { useState } from 'react';
import { sendMessage } from '../services/messageService';
import './SendMessage.css'; // Styling jika diperlukan

// const SendMessage = () => {
//   const [recipient, setRecipient] = useState('');
//   const [messageBody, setMessageBody] = useState('');

//   const handleSendMessage = async (e) => {
//     e.preventDefault();
//     try {
//       const resp = await sendMessage({ to: recipient, body: messageBody });
//       // alert(`Message sent successfully. Message SID: ${resp.sid || resp.msg}`);
//       alert(`Message sent successfully. Response: ${JSON.stringify(resp)}`);
//     } catch (error) {
//       alert('Error sending message: ' + (error.msg || 'Unknown error'));
//     }
//   };

//   return (
//     <div className="send-message-container">
//       <h2>Send Message</h2>
//       <form onSubmit={handleSendMessage}>
//         <label>Recipient Number</label>
//         <div className="input-box">
//           {/* <label>Recipient Number</label> */}
//           <input
//             type="text"
//             value={recipient}
//             onChange={(e) => setRecipient(e.target.value)}
//             placeholder="Enter recipient number, e.g., +6281234567890"
//             required
//           />
//         </div>
//         <label>Message</label>
//         <div className="input-box">
//           <textarea
//             value={messageBody}
//             onChange={(e) => setMessageBody(e.target.value)}
//             required
//           />
//         </div>
//         <button type="submit" className="btn">Send Message</button>
//       </form>
//     </div>
//   );
// };

// export default SendMessage;

const SendMessage = () => {
  const [recipient, setRecipient] = useState('');
  const [messageBody, setMessageBody] = useState('');

  const handleSendMessage = async (e) => {
    e.preventDefault();
    try {
      const data = await sendMessage({ to: recipient, body: messageBody });
      alert(`Message sent successfully. Response: ${JSON.stringify(data)}`);
    } catch (error) {
      alert('Error sending message: ' + (error.msg || error.error || 'Unknown error'));
    }
  };

  return (
    <div className="send-message-container">
      <h2>Send Message</h2>
      <form onSubmit={handleSendMessage}>
      <label>Recipient</label>
        <div className="input-box">
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="Enter recipient number"
            required
          />
        </div>
        <label>Message</label>
        <div className="input-box">
          <textarea
            value={messageBody}
            onChange={(e) => setMessageBody(e.target.value)}
            placeholder="Type your message"
            required
          />
        </div>
        <button type="submit" className="btn">Send Message</button>
      </form>
    </div>
  );
};

export default SendMessage;