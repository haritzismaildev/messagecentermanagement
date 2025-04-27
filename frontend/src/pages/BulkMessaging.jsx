import React, { useState } from 'react';
import { bulkMessaging } from '../services/messageService';
import './BulkMessaging.css';

// const BulkMessaging = () => {
//   const [recipients, setRecipients] = useState(''); // Daftar nomor, misalnya dipisahkan dengan koma
//   const [messageBody, setMessageBody] = useState('');

//   const handleBulkMessaging = async (e) => {
//     e.preventDefault();
//     // Misal, kita pisahkan nomor berdasarkan koma
//     const recipientArray = recipients.split(',').map(num => num.trim());
//     try {
//       const resp = await bulkMessaging({ recipients: recipientArray, body: messageBody });
//       alert(`Bulk message sent successfully. ${resp.msg}`);
//     } catch (error) {
//       alert('Error sending bulk message: ' + (error.msg || 'Unknown error'));
//     }
//   };

//   return (
//     <div className="bulk-messaging-container">
//       <h2>Bulk Messaging</h2>
//       <form onSubmit={handleBulkMessaging}>
//         <div className="input-box">
//           <label>Recipients (comma-separated)</label>
//           <textarea
//             value={recipients}
//             onChange={(e) => setRecipients(e.target.value)}
//             placeholder="e.g., +6281234567890, +6289876543210"
//             required
//           />
//         </div>
//         <div className="input-box">
//           <label>Message</label>
//           <textarea
//             value={messageBody}
//             onChange={(e) => setMessageBody(e.target.value)}
//             required
//           />
//         </div>
//         <button type="submit" className="btn">Send Bulk Message</button>
//       </form>
//     </div>
//   );
// };

// export default BulkMessaging;

const BulkMessaging = () => {
  const [recipients, setRecipients] = useState('');
  const [messageBody, setMessageBody] = useState('');

  const handleBulkMessaging = async (e) => {
    e.preventDefault();
    // Pisahkan nomor penerima berdasarkan koma
    const recipientArray = recipients.split(',').map(num => num.trim());
    try {
      const data = await bulkMessaging({ recipients: recipientArray, body: messageBody });
      alert(`Bulk message sent successfully. Response: ${JSON.stringify(data)}`);
    } catch (error) {
      alert('Error sending bulk message: ' + (error.msg || error.error || 'Unknown error'));
    }
  };

  return (
    <div className="bulk-messaging-container">
      <h2>Bulk Messaging</h2>
      <form onSubmit={handleBulkMessaging}>
        <div className="input-box">
          <textarea
            value={recipients}
            onChange={(e) => setRecipients(e.target.value)}
            placeholder="Enter recipients separated by commas"
            required
          />
          <label>Recipients</label>
        </div>
        <div className="input-box">
          <textarea
            value={messageBody}
            onChange={(e) => setMessageBody(e.target.value)}
            placeholder="Type your message"
            required
          />
          <label>Message</label>
        </div>
        <button type="submit" className="btn">Send Bulk Message</button>
      </form>
    </div>
  );
};

export default BulkMessaging;