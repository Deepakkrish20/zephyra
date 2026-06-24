import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const connStr = process.env.MONGO_URI || 'mongodb://localhost:27017/zephyra';
    const conn = await mongoose.connect(connStr);
    console.log(`[Database] MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[Database] MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
