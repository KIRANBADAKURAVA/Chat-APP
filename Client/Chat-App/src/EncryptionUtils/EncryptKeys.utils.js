/* 1. Generate Key Pair
2. store private key in indexedDB
3. Register user with public key
4. Encrypt message with AES
5. Encrypt AES key with recipient's public key
6. Send encrypted payload
*/



const generateKeyPair = async()=> {
    try {
        const keyPair = await crypto.subtle.generateKey(
            {
                name: "RSA-OAEP",
                modulusLength: 2048,
                publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
                hash: "SHA-256",
            },
            true, 
            ["encrypt", "decrypt"] 
        )
        return keyPair;
    } catch (error) {
        console.error("Error generating key pair:", error);
        throw error;
    }
    
}


const storeKeyPair = async(keyPair)=> {
    // Step 1: Open (or create) the database
const request = indexedDB.open('MyChatAppDB', 1);

request.onupgradeneeded = function (event) {
  const db = event.target.result;
  // Create an object store if it doesn't exist
  db.createObjectStore('cryptoKeys');
};

request.onsuccess = function (event) {
  const db = event.target.result;

  // Step 2: Start a transaction
  const tx = db.transaction('cryptoKeys', 'readwrite');
  const store = tx.objectStore('cryptoKeys');

  // Step 3: Store a key 
  
  store.put(keyPair, 'my-private-key');

  tx.oncomplete = () => console.log('Key stored successfully');
  tx.onerror = () => console.error('Transaction failed');
};

}

// retrive reciepient public key 

const getRecipientPublicKey = async (userId) => {
    try{
        const response = await fetch(`/api/v1/user/publicKey/${userId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch recipient public key');
        }

        const data = await response.json();
        const base64PublicKey = data.data.publicKey;
        
        // Convert base64 string to ArrayBuffer
        const binaryString = window.atob(base64PublicKey);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        
        // Import the public key as a CryptoKey
        const publicKey = await crypto.subtle.importKey(
            "spki",
            bytes,
            {
                name: "RSA-OAEP",
                hash: "SHA-256",
            },
            true,
            ["encrypt"]
        );
        
        return publicKey;

    }
    catch(error) {
        console.error("Error retrieving recipient's public key:", error);
        throw error;
}

}

// Generate AES key for message encryption
const generateAESKey = async () => {
    try {
        const key = await crypto.subtle.generateKey(
            {
                name: "AES-GCM",
                length: 256,
            },
            true, 
            ["encrypt", "decrypt"] 
        );
        return key;
    } catch (error) {
        console.error("Error generating AES key:", error);
        throw error;
    }
}




export {generateKeyPair, storeKeyPair, generateAESKey, getRecipientPublicKey};