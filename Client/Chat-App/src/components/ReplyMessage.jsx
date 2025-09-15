import React, { useState, useEffect } from 'react';
import { FiCornerUpLeft } from 'react-icons/fi';
import { decryptMessage } from '../EncryptionUtils/Decrypt.utils.js';

const ReplyMessage = ({ replyTo, isCurrentUser, profilePic, userProfilePic, currentUserID }) => {
    const [decryptedContent, setDecryptedContent] = useState('');

    useEffect(() => {
        const decryptReplyContent = async () => {
            if (replyTo && replyTo.content) {
                // Check if this is an encrypted message
                if (replyTo.encryptedKeys && replyTo.iv && replyTo.encryptedKeys[currentUserID]) {
                    try {
                        const decrypted = await decryptMessage(
                            replyTo.content,
                            replyTo.encryptedKeys[currentUserID],
                            replyTo.iv
                        );
                        setDecryptedContent(decrypted);
                    } catch (error) {
                        console.error('Error decrypting reply message:', error);
                        setDecryptedContent('[Failed to decrypt]');
                    }
                } else {
                    // For non-encrypted messages or when we don't have the key
                    setDecryptedContent(replyTo.content || 'Message');
                }
            } else {
                setDecryptedContent('Message');
            }
        };

        decryptReplyContent();
    }, [replyTo, currentUserID]);

    if (!replyTo) return null;

        return (
        <div className={`flex items-center mb-1 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex items-center max-w-xs ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Reply icon */}
                <div className={`flex items-center text-xs text-gray-500 dark:text-gray-400 ${isCurrentUser ? 'ml-1' : 'mr-1'}`}>
                    <FiCornerUpLeft className="w-3 h-3" />
                </div>
                
                {/* Reply content */}
                <div className={`max-w-32 px-2 py-1 rounded-lg text-xs break-words ${
                    isCurrentUser 
                        ? 'bg-blue-400 dark:bg-blue-500 text-white' 
                        : 'bg-gray-200 dark:bg-dark-tertiary text-gray-700 dark:text-dark-text'
                }`}>
                    <div className="truncate">
                        {decryptedContent}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReplyMessage; 