const dns = require('dns');
try { dns.setServers(['8.8.8.8', '1.1.1.1']); } catch (_) {}
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000,
    });
    console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.warn('⚠️ Atlas connection timed out/failed:', err.message);
    try {
      console.log('🔄 Attempting local MongoDB connection (mongodb://127.0.0.1:27017/svs)...');
      const localConn = await mongoose.connect('mongodb://127.0.0.1:27017/svs', {
        serverSelectionTimeoutMS: 5000,
      });
      console.log(`✅ Local MongoDB Connected: ${localConn.connection.host}`);
      return localConn;
    } catch (localErr) {
      console.error('❌ MongoDB Connection Error:\n' +
        '1. If using MongoDB Atlas: Whitelist your IP (0.0.0.0/0) at https://cloud.mongodb.com -> Network Access.\n' +
        '2. If using local MongoDB: Ensure MongoDB service is running.\n' +
        'Error details: ' + err.message);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
