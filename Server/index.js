import connectDB from "./db/indexdb.js";
import dotenv from "dotenv";
import app from "./app.js";
import { createServer } from "http";
import { Server } from "socket.io";
import { log } from "console";

dotenv.config({ path: "./.env" });

connectDB()
    .then(() => {
        const httpServer = createServer(app);

        const io = new Server(httpServer, {
            cors: {
                origin: process.env.FRONTEND_URL,
                methods: ["GET", "POST"],
            },
        });

        io.on("connection", (socket) => {
            console.log("New connection");

            
            socket.on("setup", (userdata) => {
                if (userdata && userdata._id) {
                    socket.join(userdata._id);
                    console.log("User joined:", userdata._id);
                    socket.emit("connected");
                } else {
                    console.error("Invalid user data:", userdata);
                }
            });

            socket.on("disconnecting", () => {
                console.log("User disconnecting from rooms:", [...socket.rooms]);
            });

            socket.on("join chat", (room) => {
                if (room) {
                    socket.join(room);
                    console.log("User joined room:", room);
                } else {
                    console.error("Invalid room:", room);
                }
            });

            socket.on("new message", (message) => {
                console.log("New message received:", message);
                console.log("Type of message:", typeof message);
            
                const recievers = message?.message?.reciever;
            
                if (Array.isArray(recievers)) {
                    recievers.forEach((reciever) => {
                        console.log("Sending message to:", reciever);
                        socket.to(reciever).emit("message received", message);
                    });
                } else {
                    console.error("Invalid receiver data:", recievers);
                    socket.emit("error", { message: "Invalid receiver data", data: message });
                }
            });
            
        });

        httpServer.listen(process.env.PORT, () => {
            console.log(`Server is running on port ${process.env.PORT}`);
        });
    })
    .catch((error) => {
        console.error("Error connecting to the database:", error);
    });
