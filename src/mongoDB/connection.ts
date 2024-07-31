import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const mongoDBConnect = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URL as string);
    console.log("MongoDB - Connected");
  } catch (error) {
    console.error("Error - MongoDB Connection:", error);
    process.exit(1);
  }
};

export default mongoDBConnect;
