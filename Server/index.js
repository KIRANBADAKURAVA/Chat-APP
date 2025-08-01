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
                upgrade: true,
            },
        });

        io.on("connection", (socket) => {
             console.log("New connection" , socket.id);

            
            socket.on("setup", (userdata) => {
                if (userdata && userdata._id) {
                    users[userdata._id] = socket.id;
                    socket.userId = userdata._id;
                    console.log("socket.userId", socket.userId);
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

            socket.on("new message", async (message) => {
                 console.log("New message received:", message);
                
                try {
                    // Get recipients from chat participants instead of message.receiver
                    const { getMessageRecipients } = await import('./utils/messageUtils.js');
                    const recipients = await getMessageRecipients(message.chat, message.sender);
                    
                    console.log("Recipients from chat:", recipients);
                console.log("Users object:", users);
                
                    recipients.forEach((recipient) => {
                        if (users[recipient]) {
                            console.log("Sending message to:", users[recipient]);
                            io.to(users[recipient]).emit("message received", message);
                        } else {
                            console.log("User offline:", recipient);
                        }
                    });
                } catch (error) {
                    console.error("Error getting recipients:", error);
                    socket.emit("error", { message: "Error getting recipients", data: message });
                }
            });

            socket.on("UpdateSeen", (data) => {
                console.log("Update seen status for message:", data);
                const sender = data.sender;

                io.to(socket.id).emit("message seen", data);
            }
            );
            socket.on("typing", (receiver) => {
                console.log("User is typing:",  "Receiver:", users[receiver]);
                if(users[receiver]) {
                    io.to(users[receiver]).emit("typing",receiver);
                }
            });
            socket.on("stop typing", (receiver) => {
                console.log("User stoped typing:",  "Receiver:",receiver);
                if(users[receiver]) {
                    io.to(users[receiver]).emit("stop typing", receiver);
                }
            });

            socket.on("online", ()=>{
                console.log("Online users requested");
                io.emit("online list", Object.keys(users));
            })
            socket.on("offline", (userId)=>{
                console.log("setting offline");
                io.emit("set offline", userId);
            })
            
           
        });

        httpServer.listen(process.env.PORT, () => {
            console.log(`Server is running on port ${process.env.PORT}`);
        });
    })
    .catch((error) => {
        console.error("Error connecting to the database:", error);
    });
