import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI;

export const connectDB = async () => {
    if (!MONGO_URI) {
        throw new Error("MONGO_URI is not defined");
    }
    mongoose.set('strictQuery', true);
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected");
};
