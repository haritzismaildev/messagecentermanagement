const amqp = require('amqplib');
let channel;

async function initBroker() {
    try {
        const conn = await amqp.connect(process.env.RABBIT_URL);
        channel = await conn.createChannel();
        console.log('Connected to RabbitMQ');
    } catch (err) {
        console.error('RabbitMQ Error : ', err);
    }
}

function sendToQueue(queue, msg) {
    if (!channel) throw new Error('Channel not initialized');
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(msg)));
}

module.exports = { initBroker, sendToQueue };