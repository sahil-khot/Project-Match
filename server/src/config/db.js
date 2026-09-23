import mongoose from 'mongoose';

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/project_match';
  try {
    const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log(`[MongoDB] Connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.warn(`[MongoDB] Primary connection failed (${error.message}).`);
    if (uri !== 'mongodb://127.0.0.1:27017/project_match') {
      try {
        console.log('[MongoDB] Attempting fallback to local MongoDB (mongodb://127.0.0.1:27017/project_match)...');
        const conn = await mongoose.connect('mongodb://127.0.0.1:27017/project_match', { serverSelectionTimeoutMS: 5000 });
        console.log(`[MongoDB] Fallback connected: ${conn.connection.host}/${conn.connection.name}`);
        return;
      } catch (localErr) {
        console.error(`[MongoDB] Fallback failed: ${localErr.message}`);
      }
    }
    process.exit(1);
  }
};
