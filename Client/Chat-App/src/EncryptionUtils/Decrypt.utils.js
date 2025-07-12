import { get } from 'idb-keyval';

/*
1.Retreive private key from indexDB
2.Decrypt the AES key using the private key
3. Decrypt the message using the decrypted AES key

*/ 

function base64ToArrayBuffer(base64) {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}

const getPrivateKey = async () => {
    const jwk = await get('my-private-key');
    console.log('Retrieved JWK from IndexedDB:', jwk);
    if (!jwk) {
        console.log('No private key found in IndexedDB.');
        return null;
    }
    try {
        const privateKey = await window.crypto.subtle.importKey(
            'jwk',
            jwk,
            { name: 'RSA-OAEP', hash: 'SHA-256' },
            true,
            ['decrypt']
        );
        return privateKey;
    } catch (e) {
        console.error('Error importing private key from JWK:', e);
        return null;
    }
};

const decryptMessage = async (encryptedMessage, encryptedAESKey, iv) => {
    console.log('Decrypting message...');
    try {
        const privateKey = await getPrivateKey();
        if (!privateKey) {
            throw new Error('Private key not found in IndexedDB');
        }

        // Convert base64 strings to ArrayBuffers
        const encryptedAESKeyBuffer = typeof encryptedAESKey === 'string' ? base64ToArrayBuffer(encryptedAESKey) : encryptedAESKey;
        const ivBuffer = typeof iv === 'string' ? base64ToArrayBuffer(iv) : iv;
        const encryptedMessageBuffer = typeof encryptedMessage === 'string' ? base64ToArrayBuffer(encryptedMessage) : encryptedMessage;

        console.log(privateKey.usages.includes("decrypt"));

        const aesKeyBuffer = await window.crypto.subtle.decrypt(
            { name: 'RSA-OAEP' },
            privateKey,
            encryptedAESKeyBuffer
        );

        const aesKey = await window.crypto.subtle.importKey(
            'raw',
            aesKeyBuffer,
            { name: 'AES-GCM' },
            false,
            ['decrypt']
        );

        const decryptedMessageBuffer = await window.crypto.subtle.decrypt(
            {
                name: 'AES-GCM',
                iv: new Uint8Array(ivBuffer)
            },
            aesKey,
            encryptedMessageBuffer
        );

        console.log('Decrypted message:', decryptedMessageBuffer);

        return new TextDecoder().decode(decryptedMessageBuffer);
    } catch (error) {
        console.error('Error decrypting message:', error);
    }
};


export { decryptMessage, getPrivateKey };