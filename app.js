import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app = express()
import dotenv from 'dotenv';
dotenv.config();

// cors 
app.use(cors({
    options: process.env.FRONTEND_URL,
    credentials: true
}))

//json 
app.use(express.json({
    limit: '16kb'
}))

//url

app.use(express.urlencoded({
    extended:true,
    limit: '16kb'
}))


//cache
app.use(express.static('public'))

app.use(cookieParser())

import UserRouter from './routes/User.routes.js'
import MessageRouter from './routes/message.routes.js';
import ChatRouter from './routes/Chats.routes.js';



app.use('/api/v1/user', UserRouter)
app.use('/api/v1/message', MessageRouter)
app.use('/api/v1/chat', ChatRouter)




export default app