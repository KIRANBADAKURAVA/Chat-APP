import { Router } from "express";
import { AddMessage, AddGroupMessage } from "../controllers/message.controller.js";
import verifyToken from "../middlewares/auth.middleware.js";


const MessageRouter = Router()


MessageRouter.route('/sendIndividualMessage/:userId').post(verifyToken, AddMessage)
MessageRouter.route('/sendGroupMessage/:chatId').post(verifyToken, AddGroupMessage)

export default MessageRouter