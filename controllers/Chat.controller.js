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
  

export { getAllChats }