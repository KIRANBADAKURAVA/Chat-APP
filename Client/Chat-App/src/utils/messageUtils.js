import { generateAESKey, getRecipientPublicKey } from '../EncryptionUtils/EncryptKeys.utils';
import { EncryptMessage, encryptAESKeyWithPublicKey } from '../EncryptionUtils/Encrypt.utils';

// Helper function to convert ArrayBuffer to base64
const arrayBufferToBase64 = (buffer) => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
};


export const sendEncryptedIndividualMessage = async (recipientID, messageText, currentUserID, socketRef) => {

    if (!recipientID || !messageText || !currentUserID) {
        throw new Error("recipientID, messageText, and currentUserID are required");
    }
    console.log("Sending encrypted message to:", recipientID, "Message:", messageText, "From user ID:", currentUserID);
    try {
        // 1. Generate AES key
        const aesKey = await generateAESKey();
        
        // 2. Encrypt message
        const { iv, encryptedMessage } = await EncryptMessage(aesKey, new TextEncoder().encode(messageText));
        
        // 3. Get recipient's public key
        const recipientPublicKey = await getRecipientPublicKey(recipientID);
        
        // 4. Get sender's public key (for self-decryption)
        const senderPublicKey = await getRecipientPublicKey(currentUserID);
        
        // 5. Encrypt AES key with recipient's public key
        const encryptedAESKeyForRecipient = await encryptAESKeyWithPublicKey(aesKey, recipientPublicKey);
        
        // 6. Encrypt AES key with sender's public key
        const encryptedAESKeyForSender = await encryptAESKeyWithPublicKey(aesKey, senderPublicKey);
        
        // 7. Convert ArrayBuffers to base64 for transmission
        const payload = {
            encryptedMessage: arrayBufferToBase64(encryptedMessage),
            iv: arrayBufferToBase64(iv),
            encryptedAESKeyForRecipient: arrayBufferToBase64(encryptedAESKeyForRecipient),
            encryptedAESKeyForSender: arrayBufferToBase64(encryptedAESKeyForSender),
        };

        const response = await fetch(
            `/api/v1/message/sendIndividualMessage/${recipientID}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("accesstoken")}`,
                },
                body: JSON.stringify(payload),
            }
        );

        if (!response.ok) {
            throw new Error(`Failed to send message: ${response.statusText}`);
        }

        const data = await response.json();
        
        // Emit message with correct structure for real-time updates
        if (socketRef && socketRef.current) {
            socketRef.current.emit("new message", { 
                message: data.data.message,
                chat: data.data.chat._id,
                sender: currentUserID
            });
        }

        return data;
    } catch (error) {
        console.error("Error sending encrypted individual message:", error.message);
        throw error;
    }
};


export const sendEncryptedGroupMessage = async (chatId, messageText, currentUserID, socketRef) => {
    try {
        // 1. Generate AES key
        const aesKey = await generateAESKey();
        
        // 2. Encrypt message
        const { iv, encryptedMessage } = await EncryptMessage(aesKey, new TextEncoder().encode(messageText));
        
        // 3. Get recipient's public key (for group, you may need to loop over all members, but for now use chatId)
        const recipientPublicKey = await getRecipientPublicKey(chatId);
        
        // 4. Get sender's public key (for self-decryption)
        const senderPublicKey = await getRecipientPublicKey(currentUserID);
        
        // 5. Encrypt AES key with recipient's public key
        const encryptedAESKeyForRecipient = await encryptAESKeyWithPublicKey(aesKey, recipientPublicKey);
        
        // 6. Encrypt AES key with sender's public key
        const encryptedAESKeyForSender = await encryptAESKeyWithPublicKey(aesKey, senderPublicKey);
        
        // 7. Convert ArrayBuffers to base64 for transmission
        const payload = {
            encryptedMessage: arrayBufferToBase64(encryptedMessage),
            iv: arrayBufferToBase64(iv),
            encryptedAESKeyForRecipient: arrayBufferToBase64(encryptedAESKeyForRecipient),
            encryptedAESKeyForSender: arrayBufferToBase64(encryptedAESKeyForSender),
        };

        const response = await fetch(
            `/api/v1/message/sendGroupMessage/${chatId}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("accesstoken")}`,
                },
                body: JSON.stringify(payload),
            }
        );

        if (!response.ok) {
            throw new Error(`Failed to send group message: ${response.statusText}`);
        }

        const data = await response.json();
        
        // Emit message for real-time updates
        if (socketRef && socketRef.current) {
            socketRef.current.emit("new message", { message: data.data.message });
        }

        return data;
    } catch (error) {
        console.error("Error sending encrypted group message:", error.message);
        throw error;
    }
};


export const sendSimpleMessage = async (recipientID, messageText, currentUserID) => {
    // Use the same encryption logic as sendEncryptedIndividualMessage
    return await sendEncryptedIndividualMessage(recipientID, messageText, currentUserID, null);
};


export const sendGreetingMessage = async (user, currentUserID) => {
    return await sendSimpleMessage(user._id, `Hi ${user.username}`, currentUserID);
};


export const stopTyping = (recipientID, socketRef) => {
    if (socketRef && socketRef.current) {
        socketRef.current.emit("stop typing", { to: recipientID });
    }
};


export const startTyping = (recipientID, socketRef) => {
    if (socketRef && socketRef.current) {
        socketRef.current.emit("typing", recipientID);
    }
}; 