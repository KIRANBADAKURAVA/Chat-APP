import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({
    path: './.env'
})

const connectDB = async () => {
    try {
      
      
      const connection = await mongoose.connect(process.env.MONGODB_URI, {
        dbName: "ChatApp", 
       
      });
      console.log(`MongoDB Connected: ${connection.connection.host}`);
    } catch (error) {
      console.error(`Error: ${error.message}`);
      process.exit(1);
    }
  };
  
    export default connectDB;