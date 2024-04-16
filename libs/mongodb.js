import mongoose from "mongoose";

const MongoUri = process.env.MONGODB_URI;

let isConnected = false;

async function connectToDatabase() {
  if (!isConnected) {
    try {
      await mongoose.connect(MongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
      isConnected = true;
      console.log('Connected to MongoDB');
    } catch (error) {
      console.error('Error connecting to MongoDB:', error);
      throw error; 
    }
  }
}

export default connectToDatabase;