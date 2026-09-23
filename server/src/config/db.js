import mongoose from 'mongoose';

let cachedConn = null;

export const connectDB = async () => {
  if (cachedConn && mongoose.connection.readyState >= 1) {
    return cachedConn;
  }

  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/project_match';
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });
    cachedConn = conn;
    console.log(`[MongoDB] Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.warn(`[MongoDB] Primary connection failed (${error.message}).`);
    if (uri !== 'mongodb://127.0.0.1:27017/project_match') {
      try {
        console.log('[MongoDB] Attempting fallback to local MongoDB (mongodb://127.0.0.1:27017/project_match)...');
        const conn = await mongoose.connect('mongodb://127.0.0.1:27017/project_match', {
          serverSelectionTimeoutMS: 5000,
        });
        cachedConn = conn;
        console.log(`[MongoDB] Fallback connected: ${conn.connection.host}/${conn.connection.name}`);
        return conn;
      } catch (localErr) {
        console.error(`[MongoDB] Fallback failed: ${localErr.message}`);
      }
    }
    if (!process.env.VERCEL) {
      process.exit(1);
    }
    throw error;
  }
};
