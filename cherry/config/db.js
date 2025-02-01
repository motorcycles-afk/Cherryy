import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const connectDB = async () => {
    try {
        // Use MongoDB Atlas connection string or local MongoDB
        const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://cherrykey:cherrykey@cluster0.mongodb.net/cherry?retryWrites=true&w=1';
        
        const conn = await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            writeConcern: {
                w: 1,
                j: true
            }
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;
