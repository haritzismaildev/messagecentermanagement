const Message = require("./Message");

app.post('/receive-webhook', async (req, res) => {
    const { from, body } = req.body;
    console.log(`Receive message: ${body} from ${from}`);

    // simpan ke database
    await Message.create({
        sender: from,               // nomer wa
        recipient: 'admin-system',  // misalnya
        content: body,
        direction: 'inbound'
    });

    return res.json({ status: 'ok' });
});