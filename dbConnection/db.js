import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const dbConnection = async ()=>{
    console.log(process.env.MONGO_URI);
      try {
        
        
        const mongoDbConectionInstance  = await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)
        console.log("db connected succesfully");
        
      } catch (error) {
        console.log( error +  " db connection failed" );
      }
}
export default dbConnection