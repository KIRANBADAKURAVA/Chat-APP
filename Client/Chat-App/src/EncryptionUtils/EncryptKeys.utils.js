// utils for encryption 

/* 
1. Generate Key Pair
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
        console.log("Error generating key pair:", error);
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
  
  store.put(userPrivateKey, 'my-private-key');

  tx.oncomplete = () => console.log('Key stored successfully');
  tx.onerror = () => console.error('Transaction failed');
};

}


export {generateKeyPair, storeKeyPair};






