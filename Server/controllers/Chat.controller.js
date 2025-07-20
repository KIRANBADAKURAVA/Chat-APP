import Chat from "../model/chat.model.js";
import Message from "../model/message.model.js";
import { Asynchandler } from "../utils/Asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import User from "../model/user.model.js"; 
import mongoose from 'mongoose';



// get chat by id

const getChatbyId = Asynchandler(async (req, res) => {
  const chatId = req.params.chatId;
  console.log(chatId);


  // Validate chatId
  if (!mongoose.Types.ObjectId.isValid(chatId)) {
      throw new ApiError(400, 'Invalid chat ID');
  }

  const chat = await Chat.aggregate([
      {
          $match: { _id: new mongoose.Types.ObjectId(chatId) },
      },
      {
          $lookup: {
              from: 'users',
              let: { participants: '$participants' },
              pipeline: [
                  {
                      $match: {
                          $expr: { $in: ['$_id', '$$participants'] },
                      },
                  },
                  {
                      $project: {
                          username: 1,
                          profilePicture: 1,
                      },
                  },
              ],
              as: 'participants',
          },
      },
  ]);

  // Check if chat was found
  if (chat.length === 0) {
      throw new ApiError(404, 'Chat not found');
  }

  // Extract the first chat (since aggregate always returns an array)
  const chatData = chat[0];

  // Filter participants to exclude the requesting user
  const filteredParticipants = chatData.participants.filter(
      (participant) => participant._id.toString() !== req.user._id.toString()
  );

  chatData.participants = filteredParticipants;

  return res
      .status(200)
      .json(new ApiResponse(200, chatData, 'Chat fetched successfully'));
});





// get all chats

const getAllChats = Asynchandler(async (req, res) => {
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(400, 'Invalid user ID');
    }

    const chats = await User.aggregate([
        {
            $match: { _id: new mongoose.Types.ObjectId(userId) },
        },
        {
            $lookup: {
                from: 'chats',
                let: { userChats: '$chats' },
                pipeline: [
                    {
                        $match: { $expr: { $in: ['$_id', '$$userChats'] } },
                    },
                    {
                        $lookup: {
                            from: 'users',
                            let: { chatParticipants: '$participants' },
                            pipeline: [
                                {
                                    $match: { $expr: { $in: ['$_id', '$$chatParticipants'] } },
                                },
                                {
                                    $project: { username: 1, profilePicture: 1 },
                                },
                            ],
                            as: 'participants',
                        },
                    },
                ],
                as: 'chats',
            },
        },
    ]);

    if (!chats || chats.length === 0) {
        throw new ApiError(404, 'No chats found');
    }

    const userChats = chats[0].chats;

    // Process each chat
    const formattedChats = userChats.map((chat) => {
        if (chat.isGroupChat) {
            return chat; // Return group chat as-is
        }
        return {
            ...chat,
            participants: chat.participants.filter(
                (participant) => participant._id.toString() !== userId.toString()
            ),
        };
    });

    return res.status(200).json(new ApiResponse(200, formattedChats, 'All chats fetched successfully'));
});

  

// create a group chat

const createGroupChat = Asynchandler(async (req, res) => {
    const AdminId = req.user._id; 
    const { groupName, participants } = req.body; 

    
    const updatedParticipants = [...participants, AdminId.toString()];

    // Create group chat
    const group = await Chat.create({
        participants: updatedParticipants,
        isGroupChat: true,
        groupChatName: groupName,
        
    });

    if (!group) throw new ApiError(500, 'Group chat not created');
    // console.log(group._id);
    

    // Add group ID to each participant's "chats"
    try {
        for (const userId of updatedParticipants) {
            
            
            const user = await User.findById(userId);
            if (!user) {
                // console.log('user not found');
                continue
            }; 
            
            
            user.chats.push(group._id);
            // console.log(user.chats);
            await user.save(); 
        }
    } catch (error) {
        console.error('Error updating users with group chat:', error);
        throw new ApiError(500, 'Failed to update user chats');
    }

    return res.status(201).json(new ApiResponse(201, group, 'Group chat created successfully'));
});


// update group name
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
    const { page = 1, limit = 50 } = req.query; 

    const chat = await Chat.findById(chatId);
    if(!chat) throw new ApiError(404, 'Chat not found');
    if(!chat.participants.includes(req.user._id) ) throw new ApiError(403, 'You are not a participant in this chat');

    // Calculate skip value for pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Query messages directly from Message collection using chat field
    const messages = await Message.find({ chat: chatId })
        .populate('sender', 'username profilePicture')
        .populate('replyTo', 'content sender encryptedKeys iv') 
        .sort({ createdAt: -1 }) 
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

    // Get total count for pagination info
    const totalMessages = await Message.countDocuments({ chat: chatId });

    return res.status(200).json(new ApiResponse(200, {
        messages: messages.reverse(), // Reverse to get chronological order
        pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalMessages / parseInt(limit)),
            totalMessages,
            hasNextPage: skip + messages.length < totalMessages,
            hasPrevPage: parseInt(page) > 1
        }
    }, 'All messages in chat fetched successfully'));
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
        removeParticipant,
        getChatbyId
      };