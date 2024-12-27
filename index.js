import connectDB from "./db/indexdb.js";
import dotenv from 'dotenv'
import app from './app.js'
import { createServer } from 'http'
import { Server } from 'socket.io'

const httpServer = createServer(app)

const io = new Server(httpServer, {
    cors: {
        origin: process.env.FRONTEND_URL,
        credentials: true
    }
})

io.on('connection', (socket) => {
    console.log('a user connected')
    socket.on('disconnect', () => {
        console.log('user disconnected')
    })
})





dotenv.config({
    path: './.env'
})


connectDB()
.then(()=>{
   
 httpServer.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`)
    app.set('io', io);
   
})
})
.catch((error )=>(console.error('Error in conneting server at index.js file ',   
    error)))