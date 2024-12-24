import { Router } from "express";
import { AddMessage } from "../controllers/message.controller.js";
import verifyToken from "../middlewares/auth.middleware.js";


const MessageRouter = Router()


MessageRouter.route('/sendIndividualMessage/:userId').post(verifyToken, AddMessage)

export default MessageRouter