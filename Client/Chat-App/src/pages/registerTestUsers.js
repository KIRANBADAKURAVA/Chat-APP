// Script to register 10 dummy users with E2EE public keys
// Run this in the browser console or adapt for Node.js

async function generateRSAKeyPair() {
    const keyPair = await window.crypto.subtle.generateKey(
        {
            name: "RSA-OAEP",
            modulusLength: 2048,
            publicExponent: new Uint8Array([1, 0, 1]),
            hash: "SHA-256",
        },
        true,
        ["encrypt", "decrypt"]
    );
    const publicKey = await window.crypto.subtle.exportKey("spki", keyPair.publicKey);
    const privateKey = await window.crypto.subtle.exportKey("pkcs8", keyPair.privateKey);
    return { publicKey, privateKey };
}

function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

// List of actual names and profile photos
const dummyUsers = [
  { username: 'alice.smith', password: 'Password1!', name: 'Alice Smith', profilePicture: 'https://randomuser.me/api/portraits/women/68.jpg' },
  { username: 'bob.jones', password: 'Password2!', name: 'Bob Jones', profilePicture: 'https://randomuser.me/api/portraits/men/65.jpg' },
  { username: 'charlie.brown', password: 'Password3!', name: 'Charlie Brown', profilePicture: 'https://randomuser.me/api/portraits/men/32.jpg' },
  { username: 'diana.prince', password: 'Password4!', name: 'Diana Prince', profilePicture: 'https://randomuser.me/api/portraits/women/44.jpg' },
  { username: 'eve.adams', password: 'Password5!', name: 'Eve Adams', profilePicture: 'https://randomuser.me/api/portraits/women/12.jpg' },
  { username: 'frank.miller', password: 'Password6!', name: 'Frank Miller', profilePicture: 'https://randomuser.me/api/portraits/men/23.jpg' },
  { username: 'grace.lee', password: 'Password7!', name: 'Grace Lee', profilePicture: 'https://randomuser.me/api/portraits/women/50.jpg' },
  { username: 'henry.clark', password: 'Password8!', name: 'Henry Clark', profilePicture: 'https://randomuser.me/api/portraits/men/41.jpg' },
  { username: 'irene.kim', password: 'Password9!', name: 'Irene Kim', profilePicture: 'https://randomuser.me/api/portraits/women/60.jpg' },
  { username: 'jack.turner', password: 'Password10!', name: 'Jack Turner', profilePicture: 'https://randomuser.me/api/portraits/men/12.jpg' },
];

async function urlToFile(url, filename) {
  const response = await fetch(url);
  const blob = await response.blob();
  return new File([blob], filename, { type: blob.type });
}

async function registerDummyUser(user) {
  // Only send username, password, and profilePicture
  const formData = new FormData();
  formData.append('username', user.username);
  formData.append('password', user.password);
  formData.append('profilePicture', user.profilePicture);
  // Optionally, add a 'name' field if your backend supports it
  // formData.append('name', user.name);
  const response = await fetch('/api/v1/user/register', {
    method: 'POST',
    body: formData,
  });
  const data = await response.json();
  return data;
}

async function registerTenDummyUsers() {
  for (const user of dummyUsers) {
    try {
      const result = await registerDummyUser(user);
      console.log(`Registered: ${user.username} (${user.name})`, result);
    } catch (err) {
      console.error(`Failed to register ${user.username}:`, err);
    }
  }
}

// To run: open browser console on your app and paste this file, then call:
registerTenDummyUsers(); 