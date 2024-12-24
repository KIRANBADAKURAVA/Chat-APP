import { Router } from "express";
import {getAllChats} from "../controllers/Chat.controller.js";
import verifyToken from "../middlewares/auth.middleware.js";
 

const ChatRouter = Router();

ChatRouter.route('/getallchats').get(verifyToken, getAllChats);

export default ChatRouter;

