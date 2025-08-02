import Chat from "../model/chat.model.js";

export const getMessageRecipients = async (chatId, senderId) => {
    try {
        const chat = await Chat.findById(chatId).populate('participants');
        if (!chat) {
            throw new Error('Chat not found');
        }
        
        // Filter out the sender from participants to get recipients
        const recipients = chat.participants
            .filter(participant => participant._id.toString() !== senderId.toString())
            .map(participant => participant._id);
            
        return recipients;
    } catch (error) {
        console.error('Error getting message recipients:', error);
        throw error;
    }
};


export const getChatParticipants = async (chatId) => {
    try {
        const chat = await Chat.findById(chatId).populate('participants');
        if (!chat) {
            throw new Error('Chat not found');
        }
        
        return chat.participants.map(participant => participant._id);
    } catch (error) {
        console.error('Error getting chat participants:', error);
        throw error;
    }
}; 