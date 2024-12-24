import { Router } from "express";
import {getAllChats, createGroupChat, addParticipant, getAllMessages, deleteChat,updateGroupName,
    removeParticipant
} from "../controllers/Chat.controller.js";
import verifyToken from "../middlewares/auth.middleware.js";

 

const ChatRouter = Router();

ChatRouter.route('/getallchats').get(verifyToken, getAllChats);
ChatRouter.route('/addParticipant/:chatId').post(verifyToken, addParticipant);
ChatRouter.route('/creategroupchat').post(verifyToken, createGroupChat);
ChatRouter.route('/getallmessages/:chatId').get(verifyToken, getAllMessages);
ChatRouter.route('/deletechat/:chatId').delete(verifyToken, deleteChat);
ChatRouter.route('/updategroupname/:chatId').patch(verifyToken, updateGroupName);
ChatRouter.route('/removeparticipant/:chatId').delete(verifyToken, removeParticipant);
export default ChatRouter;

