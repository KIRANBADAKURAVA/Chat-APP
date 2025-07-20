import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({     
    
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    chat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chat',
        required: true, 
    },
    seen: {
        type: Boolean,
        default: false,
    },
    encryptedKeys: {
        type: Map,
        of: String,
        required: true,
    },
    iv: {
        type: String,
        required: true,
    },

    replyTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message',
    },
},
{
    timestamps: true,
});


messageSchema.index({ chat: 1, createdAt: 1 });
messageSchema.index({ sender: 1 });

const Message = mongoose.model('Message', messageSchema);

export default Message;