const mongoose = require('mongoose');

async function connectDB() {
    try {
        // pastikan anda punya environmemt var Mongo_URI
        // await mongoose.connect(process.env.Mongo_URI);
        // console.log('MongoDB Sudah Berhasil Terkoneksi!');
        // await mongoose.connect(process.env.MONGO_URI, {
        //     useNewUrlParser: true,
        //     useUnifiedTopology: true,
        //   });
        //   console.log('Connected to MongoDB!');
        // console.log('Using database:', mongoose.connection.name);
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB!');
        console.log('Using database:', mongoose.connection.name);
    } catch (err) {
        console.error('MongoDB connection error: ', err);
    }
}

module.exports = { connectDB };