import mongoose from "mongoose"
import {DB_NAME} from "../constants.js"

const connectDB = async ()=>{
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        // console.log(`\nMONGO_DB connected !! DB Host: ${connectionInstance.connection.host}`);
        console.log("DATA BASE CONNECTED SUCCESSFULLY");
    } catch (error) {
        console.log("MONGODB connection error", error);
        process.exit(1); 
    }
}

export default connectDB;