import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDb=async ()=>{
    await mongoose.connect(process.env.MONGODBURL as string).then(()=>{
        console.log("DB connected");
    }).catch((error)=>{
        console.log("DB error",error);
        
    })
}
export default connectDb;