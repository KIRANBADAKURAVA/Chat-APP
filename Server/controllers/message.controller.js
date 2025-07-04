import Message from "../model/message.model.js";
import { Asynchandler } from "../utils/Asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Chat from "../model/chat.model.js";
import User from "../model/user.model.js"; // Assuming User model is defined

// create a new individual message
const AddMessage = Asynchandler(async (req, res) => {
  try {
    const senderId = req.user._id;
    const sender = senderId.toString()
    const receiverId = req.params.userId;
    //console.log(sender);
    
    const { content } = req.body;
    //console.log(content);
    if(!content) throw new ApiError(400, "Message content is required");
    // Fetch recipient user
    const recipientUser = await User.findById(receiverId);
    if (!recipientUser) throw new ApiError(404, "Recipient user not found");

    // Create or find chat
    let chat = await Chat.findOne({
      participants: { $all: [sender, [receiverId]] },
      isGroupChat: false,
      
    });

    if (!chat) {
      chat = await Chat.create({
        participants: [sender, [receiverId]],
        isGroupChat: false,
        latestMessage: content,
      });
    } else {
      chat.latestMessage = content;
      await chat.save();
    }
   

    if (!chat) throw new ApiError(500, "Chat not created");

    // Create message
    const newMessage = await Message.create({
      chat: chat._id,
      sender,
      reciever: [receiverId],
      content,
    });

    if (!newMessage) throw new ApiError(500, "Message not sent");
    // console.log(sender, receiverId);
    

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
         chat.messages.push(newMessage._id);
        await chat.save();

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
  const { content } = req.body;

  const groupChat = await Chat.findById(chatId );
  if (!groupChat) throw new ApiError(404, "Group chat not found");
  groupChat.latestMessage = content;
  await groupChat.save();
  const recievers = groupChat.participants.filter((participant) => participant.toString() !== sender.toString());
  const newMessage = await Message.create({
    chat: chatId,
    sender,
    reciever: recievers,
    content,
  });

  if (!newMessage) throw new ApiError(500, "Message not sent");

  groupChat.messages.push(newMessage._id);
  await groupChat.save();

  


  return res.status(201).json(  
    new ApiResponse(201, newMessage, "Message sent successfully")
  );
} 
);



export { AddMessage, AddGroupMessage };
