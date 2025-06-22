import connectDB from "./db/indexdb.js";
import dotenv from "dotenv";
import app from "./app.js";
import { createServer } from "http";
import { Server } from "socket.io";


dotenv.config({ path: "./.env" });

connectDB()
    .then(() => {
        const httpServer = createServer(app);

        const users= {};

        const io = new Server(httpServer, {
            cors: {
                origin: process.env.FRONTEND_URL,
                methods: ["GET", "POST"],
            },
        });

        io.on("connection", (socket) => {
             console.log("New connection" , socket.id);

            
            socket.on("setup", (userdata) => {
                if (userdata && userdata._id) {
                    users[userdata._id] = socket.id;
                    socket.userId = userdata._id;
                    console.log("User joined:", userdata._id);
                    socket.emit("connected");
                } else {
                    console.error("Invalid user data:", userdata);
                }
            });

            socket.on("disconnect", () => {
                if (socket.userId && users[socket.userId]) {
                    delete users[socket.userId];
                    console.log("User disconnected:", socket.userId);
                }
            });

            socket.on("disconnecting", () => {
                // Clean up user from users object
                if (socket.userId && users[socket.userId]) {
                    delete users[socket.userId];
                    console.log("User disconnecting:", socket.userId);
                }
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
                
                const recievers = message?.reciever;
                console.log("Receivers:", typeof recievers);
                console.log("Users object:", users);
                
                if (Array.isArray(recievers)) {
                    recievers.forEach((reciever) => {
                        if (users[reciever]) {
                            console.log("Sending message to:", users[reciever]);
                            io.to(users[reciever]).emit("message received", message);
                        } else {
                            console.log("User offline:", reciever);
                        }
                    });
                } else if(typeof recievers === 'string' && users[recievers]) {
                    console.log("Sending message to single receiver:", users[recievers]);
                    io.to(users[recievers]).emit("message received", message);
                } else {
                    console.error("Invalid receiver data or user offline:", recievers);
                    socket.emit("error", { message: "Invalid receiver data or user offline", data: message });
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
