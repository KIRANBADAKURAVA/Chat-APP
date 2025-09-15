# Chat Application Overview

This project is a base for any chat application, featuring end-to-end encryption and real-time collaboration.

🔗 **Live Demo:** [https://chat-app-k55q.vercel.app/](https://chat-app-k55q.vercel.app/)
## Encryption Approach

Messages are encrypted on the client side using asymmetric cryptography (e.g., RSA or ECC) before being sent to the server. Each user has a unique public/private key pair. When sending a message, the sender encrypts it with the recipient's public key, ensuring only the intended recipient can decrypt it with their private key. This guarantees end-to-end encryption, so even the server cannot read message contents.

## WebSockets Utilisation

The application uses WebSockets to enable real-time, bidirectional communication between clients and the server. When a user sends a message, it is transmitted instantly to the server, which then relays it to the intended recipient(s) over persistent WebSocket connections. This approach ensures low-latency message delivery and supports features like typing indicators and presence updates.

## Database Design & Scalability

The database is designed with scalability and efficiency in mind, using a schema that separates users, conversations, and messages:

- **Users Table:** Stores user profiles and public keys.
- **Conversations Table:** Tracks chat rooms or direct message threads.
- **Messages Table:** Stores encrypted messages, timestamps, sender, and conversation references.

To ensure optimal performance and reliability:
- **No Memory Limits:** The system uses persistent storage and supports horizontal scaling, so there are no practical memory limits for storing messages or user data.
- **Data Redundancy:** Data replication strategies are implemented to prevent data loss and ensure high availability.
- **Query Optimization:** Indexes are created on frequently queried fields (e.g., user IDs, conversation IDs) to speed up lookups and message retrieval.
- **Sharding:** For horizontal scaling, the database can be sharded by user or conversation ID, distributing data across multiple nodes.
- **Minimal Data Redundancy:** The schema is normalized to avoid unnecessary duplication of data, reducing storage requirements and maintaining data integrity.

This design supports high throughput, large user bases, and reliable, real-time chat experiences.
