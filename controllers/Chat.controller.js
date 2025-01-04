import Chat from "../model/chat.model.js";
import { Asynchandler } from "../utils/Asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import User from "../model/user.model.js"; 
import mongoose from 'mongoose';


// get all chats

const getAllChats = Asynchandler(async (req, res) => {
    const userId = req.user._id;
  
    const chats = await User.aggregate([
      {
        $match: {
          _id:  new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $lookup: {
          from: 'chats', 
          localField: 'chats',
          foreignField: '_id',
          as: 'chats',
          pipeline: [
            {
              $lookup: {
                from: 'users',
                localField: 'participants',
                foreignField: '_id',
                as: 'participants',
                pipeline: [
                  {
                    $project: {
                      username: 1,
                      profilePicture: 1,
                    },
                  },
                ],
              },
            },
          ],
        },
      },
    ]);
  
    if (!chats || chats.length === 0) throw new ApiError(404, 'No chat found');
    
    const chatw = chats[0].chats.map((chat) => {
        return {
          ...chat,
          participants: chat.participants.filter(
            (participant) => {
                //console.log(participant._id.toString(), userId.toString());
                return participant._id.toString() !== userId.toString()}
          ),
        };
      });
          return res.status(200).json(new ApiResponse(200, chatw, 'All chats fetched successfully'));
  });
  

  // create a group chat

  const createGroupChat = Asynchandler(async (req, res) => {
    const AdminId = req.user._id;
    const { groupName } = req.body;
    const group = Chat.create({
      participants: [AdminId],
      isGroupChat: true,
      groupName: groupName,
    });

    if (!group) throw new ApiError(500, 'Group chat not created');

    return res.status(201).json(new ApiResponse(201, group, 'Group chat created successfully'));
    }    
    );

//update group name
const updateGroupName = Asynchandler(async (req, res) => {
    const chatId = req.params.chatId;
    const { groupName } = req.body;
    const chat = await Chat.findById(chatId);
    if (!chat) throw new ApiError(404, 'Chat not found');
    if (!chat.participants.includes(req.user._id)) throw new ApiError(403, 'You are not a participant in this chat');
    chat.groupChatName = groupName;
    await chat.save();
    return res.status(200).json(new ApiResponse(200, chat, 'Group name updated successfully'));
  });
  
  
// add a participant to a group chat

const addParticipant = Asynchandler(async (req, res) => {

    const chatId = req.params.chatId;
    const {username} = req.body;

    const chat = await Chat.findById(chatId);
    if(!chat) throw new ApiError(404, 'Chat not found');

    const user= await User.findOne({username: username});

    if(!user) throw new ApiError(404, 'User not found');
    const userId = user._id;
    
    if(chat.participants.includes(userId)) throw new ApiError(400, 'User already in chat');
    chat.participants.push(userId);
    await chat.save();
    return res.status(200).json(new ApiResponse(200, chat, 'Participant added successfully'));
});

// remove a participant from a group chat
const removeParticipant = Asynchandler(async (req, res) => {
    const chatId = req.params.chatId;
    const {username} = req.body;
    const chat = await Chat.findById(chatId);
    if(!chat) throw new ApiError(404, 'Chat not found');
    const user = await User .findOne({
        username: username,
    });
    if(!user) throw new ApiError(404, 'User not found');
    const userId = user._id;
    if(!chat.participants.includes(userId)) throw new ApiError(400, 'User not in chat');
    chat.participants = chat.participants.filter((participant) => participant.toString() !== userId.toString());
    await chat.save();
    return res.status(200).json(new ApiResponse(200, chat, 'Participant removed successfully'));
}
);


// get all messages in a chat
const getAllMessages = Asynchandler(async (req, res) => {
    const {chatId} = req.params;

    const chat = await Chat.findById(chatId);
    if(!chat) throw new ApiError(404, 'Chat not found');
    if(!chat.participants.includes(req.user._id) ) throw new ApiError(403, 'You are not a participant in this chat');

    const AllMessages= await Chat.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(chatId),
            },
        },
        {
            $lookup: {
                from: 'messages',
                localField: 'messages',
                foreignField: '_id',
                as: 'messages',
                pipeline: [
                    {
                        $lookup: {
                            from: 'users',
                            localField: 'sender',
                            foreignField: '_id',
                            as: 'sender',
                            pipeline: [
                                {
                                    $project: {
                                        username: 1,
                                        profilePicture: 1,
                                    },
                                },
                            ],
                        },
                    },
                    {
                        $lookup: {
                            from: 'users',
                            localField: 'reciever',
                            foreignField: '_id',
                            as: 'reciever',
                            pipeline: [
                                {
                                    $project: {
                                        username: 1,
                                        profilePicture: 1,
                                    },
                                },
                            ],
                        },
                    }
                ],
            },
        },
    ]);
    //console.log(AllMessages);
   
    const filterdparticipants = AllMessages.map((chat) => {
        return {
            ...chat,
            participants: chat.participants.filter(
                (participant) => {
                    return participant._id.toString() !== req.user._id.toString();
                }
            ),
        };
    });

    //console.log(filterdparticipants[0].messages[0]);
    const messages = filterdparticipants[0].messages.map((message) => {
      message.sender = message.sender[0];

      return message;
    }
    );

    //console.log(messages);
    return res.status(200).json(new ApiResponse(200, messages, 'All messages in chat fetched successfully'));
    
})


// delete a chat
const deleteChat = Asynchandler(async (req, res) => {
    const chatId = req.params.chatId;
    const chat = await Chat.findByIdAndDelete(chatId);
    if(!chat) throw new ApiError(404, 'Chat not found');
    if(!chat.participants.includes(req.user._id)) throw new ApiError(403, 'You are not a participant in this chat');
    
    return res.status(200).json(new ApiResponse(200, {}, 'Chat deleted successfully'));
});

export { getAllChats, 
        createGroupChat, 
        addParticipant, 
        getAllMessages,
        deleteChat,
        updateGroupName,
        removeParticipant
      };