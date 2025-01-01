import dotenv from "dotenv"
import dbConnection from "./dbConnection/db.js"
import app from "./app.js"
import { createServer } from "http"
import { Server } from "socket.io"
import cors from "cors"
dotenv.config({
  path: "./.env"
})
const PORT = process.env.PORT || 3000
const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST']

  }
})
dbConnection()
  .then(() => {
    server.on("error", (err) => {
      console.log('server error' + err);
      throw err
    })
    server.listen(PORT, () => {
      console.log("server is running on the port" + PORT);
    })
    io.on("connection", (socket) => {
      console.log("a user connected" + socket.id);
      socket.on('disconnect', () => {
        console.log('user disconnected' + socket.id);
      });
      socket.on("joinGroup", (groupName) => {
        socket.join(groupName);
        console.log(`User ${socket.id} joined group ${groupName}`);
        io.to(groupName).emit("message", `User ${socket.id} joined the group`);
      });
      // socket.on('message' ,(message)=>{
      //   io.emit('message',message)
      //   console.log(message);
      // })
      socket.on("message", ({ groupName, message ,senderName }) => {
        console.log(`Message received for group ${groupName} via ${senderName}: ${message}`);
        socket.broadcast.to(groupName).emit("message", {message ,senderName}); // Send message to all users in the group
      });
    })

  })
  .catch((err) => {
    console.log("db connection failed", err)
  })