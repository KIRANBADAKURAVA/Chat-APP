# Chat Application Overview

This project is a base for any chat application, featuring end-to-end encryption and real-time collaboration.

## Encryption Approach

Messages are encrypted on the client side using asymmetric cryptography (e.g., RSA or ECC) before being sent to the server. Each user has a unique public/private key pair. When sending a message, the sender encrypts it with the recipient's public key, ensuring only the intended recipient can decrypt it with their private key. This guarantees end-to-end encryption, so even the server cannot read message contents.

## WebSockets Utilisation

The application uses WebSockets to enable real-time, bidirectional communication between clients and the server. When a user sends a message, it is transmitted instantly to the server, which then relays it to the intended recipient(s) over persistent WebSocket connections. This approach ensures low-latency message delivery and supports features like typing indicators and presence updates.

## Database Design & Scalability

The database is designed with scalability in mind, using a schema that separates users, conversations, and messages:

- **Users Table:** Stores user profiles and public keys.
- **Conversations Table:** Tracks chat rooms or direct message threads.
- **Messages Table:** Stores encrypted messages, timestamps, sender, and conversation references.

Indexes are used on frequently queried fields (e.g., user IDs, conversation IDs) to optimize performance. For horizontal scaling, the database can be sharded by user or conversation ID, and message storage can be distributed across multiple nodes. This design supports high throughput and large user bases.
