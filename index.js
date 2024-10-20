import dotenv from "dotenv"
import dbConnection from "./dbConnection/db.js"
import app from "./app.js"
dotenv.config({
    path: "./.env"
})


const PORT = process.env.PORT || 3000
dbConnection()
   .then(()=>{
    app.on("error" , (err)=>{
      console.log('server error' + err);
      throw err
    })
    app.listen(PORT ,()=>{
        console.log("server is running on the port" + PORT); 
    })
   })
   .catch((err)=>{
    console.log("db connection failed" , err)
   })