import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
    
    participants: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        }
    ],

    latestMessage: {
        type: String,
    
    },
    isGroupChat: {
        type: Boolean,
        default: false,
    },
    groupChatName: {
        type: String,
    },
   
},
{
    timestamps: true,
});

const Chat = mongoose.model('Chat', chatSchema);

export default Chat;
