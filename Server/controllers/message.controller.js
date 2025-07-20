import Message from "../model/message.model.js";
import { Asynchandler } from "../utils/Asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Chat from "../model/chat.model.js";
import User from "../model/user.model.js"; // Assuming User model is defined

// create a new individual message
const AddMessage = Asynchandler(async (req, res) => {
  const {encryptedMessage, encryptedAESKeyForRecipient, encryptedAESKeyForSender, iv, replyTo} = req.body;
  console.log("req.body", req.body);
  try {
    const senderId = req.user._id;
   
    const receiverId = req.params.userId;
    

    if(!encryptedMessage || !encryptedAESKeyForRecipient || !encryptedAESKeyForSender || !iv) {
      throw new ApiError(400, "Message content and keys are required");
    }
    
    const content = encryptedMessage

    if(!content) throw new ApiError(400, "Message content is required");
    

    const recipientUser = await User.findById(receiverId);
    if (!recipientUser) throw new ApiError(404, "Recipient user not found");


    // Create or find chat
    let chat = await Chat.findOne({
      participants: { $all: [senderId, receiverId] },
      isGroupChat: false,
      
    });

    if (!chat) {
      chat = await Chat.create({
        participants: [senderId, receiverId],
        isGroupChat: false,
        latestMessage: content,
      });
    } else {
      console.log("chat found");
      chat.latestMessage = content;
      await chat.save();
    }
   

    if (!chat) throw new ApiError(500, "Chat not created");

    const encryptedKeys = new Map();

    encryptedKeys.set(receiverId, encryptedAESKeyForRecipient);
    encryptedKeys.set(senderId, encryptedAESKeyForSender);

    // Create message with optional replyTo
    const messageData = {
      chat: chat._id,
      sender: senderId,
      content,
      encryptedKeys,
      iv: iv,
    };

    // Add replyTo if provided
    if (replyTo) {
      messageData.replyTo = replyTo;
    }

    const newMessage = await Message.create(messageData);

    if (!newMessage) throw new ApiError(500, "Message not sent");
    // console.log(sender, receiverId);
    
    console.log("newMessage", newMessage);
    // Update participants' chat lists
   if(!req.user.chats.includes(chat._id)) {
        req.user.chats.push(chat._id);
        await req.user.save();
        }else{
            chat.latestMessage = content;
            await chat.save();
        }

        if(!recipientUser.chats.includes(chat._id)) {
        recipientUser.chats.push(chat._id); 
        await recipientUser.save();
        }
       

    return res.status(201).json(
      new ApiResponse(201, {
        message: newMessage,
        chat,
      }, "Message sent successfully")
    );
  } catch (error) {
    throw new ApiError(500, error.message || "Internal Server Error");
  }
});

// send a message to a group chat

const AddGroupMessage = Asynchandler(async (req, res) => {  
  const chatId = req.params.chatId;
  const sender = req.user._id;
  const { content, replyTo } = req.body;

  const groupChat = await Chat.findById(chatId);
  if (!groupChat) throw new ApiError(404, "Group chat not found");
  groupChat.latestMessage = content;
  await groupChat.save();
  
  const messageData = {
    chat: chatId,
    sender,
    content,
  };

  // Add replyTo if provided
  if (replyTo) {
    messageData.replyTo = replyTo;
  }

  const newMessage = await Message.create(messageData);

  if (!newMessage) throw new ApiError(500, "Message not sent");


  return res.status(201).json(  
    new ApiResponse(201, newMessage, "Message sent successfully")
  );
} 
);



export { AddMessage, AddGroupMessage };
