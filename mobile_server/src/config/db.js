import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const connStr =
      process.env.MONGO_URI ||
      'mongodb+srv://zephyra:Nosn0dJI5e5DS4ma@cluster0.6kylk2y.mongodb.net/zephyra?retryWrites=true&w=majority&appName=Cluster0';
    
    const conn = await mongoose.connect(connStr);
    console.log(`[Mobile Database] MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[Mobile Database] MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
