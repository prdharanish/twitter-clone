import mongoose from "mongoose";

const connectDB = async () => {
    try {
        if (!process.env.MONGO_URL) {
            throw new Error("MONGO_URL is not defined in environment variables");
        }
        await mongoose.connect(process.env.MONGO_URL);
        console.log("✅ MongoDB Connected...");
    } catch (err) {
        console.error("❌ Error connecting to DB:", err.message);
        process.exit(1); // stop the server
    }
};

export default connectDB;