import axios from "axios";

const GO_API_URL = process.env.REACT_APP_GO_BACKEND_URL;
// ex: http://localhost:3663

export const fetchInboundMessages = async () => {
    const resp = await axios.get(`${GO_API_URL}/api/twilio-webhook/messages`);
    //return resp.data; // asumsi NODE balas JSON array

    // resp.data kemungkinan string JSON, kita parse:
    let parsed;
    if (typeof resp.data === 'string') {
        parsed = JSON.parse(resp.data);
    } else {
        parsed = resp.data; 
    }

    console.log('raw data from backend:', resp.data);

    return parsed;

};