import { Router } from "express";
import {getAllChats, createGroupChat, addParticipant, getAllMessages} from "../controllers/Chat.controller.js";
import verifyToken from "../middlewares/auth.middleware.js";

 

const ChatRouter = Router();

ChatRouter.route('/getallchats').get(verifyToken, getAllChats);
ChatRouter.route('/addParticipant/:chatId').post(verifyToken, addParticipant);
ChatRouter.route('/creategroupchat').post(verifyToken, createGroupChat);
ChatRouter.route('/getallmessages/:chatId').get(verifyToken, getAllMessages);
export default ChatRouter;

