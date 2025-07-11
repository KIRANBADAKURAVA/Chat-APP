// Encrypt message with AES key 
const EncryptMessage = async (aesKey, message)=> {
    try {

        const iv = crypto.getRandomValues(new Uint8Array(12));
        const encryptedMessage = await crypto.subtle.encrypt(
            {
                name: "AES-GCM",
                iv: iv,
            },
            aesKey, 
            message
        );

        return {
            iv: iv,
            encryptedMessage: encryptedMessage
        };
    }catch(error){
        console.error("Error in encrypting messages");
    }
}


// encrypt AES key with recipient's public key
const encryptAESKeyWithPublicKey = async (aesKey, recipientPublicKey) => {
    try {
        const exportedAESKey = await crypto.subtle.exportKey("raw", aesKey);
        const encryptedAESKey = await crypto.subtle.encrypt(
            {
                name: "RSA-OAEP",
            },
            recipientPublicKey,
            exportedAESKey
        );
        return encryptedAESKey;
    } catch (error) {
        console.error("Error encrypting AES key with public key:", error);
        throw error;
    }
};

export {EncryptMessage, encryptAESKeyWithPublicKey};