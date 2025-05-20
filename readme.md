# Real-Time Chat Application

## Link to website

[Visit the Website](https://chat-app-3m8g.vercel.app/)

## Overview
A fully functional real-time chat application featuring robust frontend and backend capabilities. Designed to provide seamless communication between users, the application includes real-time messaging, group chat functionalities, and secure authentication mechanisms.

## Features

### Frontend
- **Responsive UI**: Built using **React** and styled with **Tailwind CSS** for a modern and user-friendly interface.
- **State Management**: Utilized **Redux** for efficient and scalable state management.
- **Form Handling**: Implemented features like login, signup, and message creation using **React Hook Form** for form validation and handling.
- **Real-time Communication**: Integrated **Socket.IO** for real-time messaging functionality.

### Backend
- **Scalable Server**: Designed and developed using **Node.js** and **Express.js**.
- **Secure Authentication**: Implemented **JWT-based authentication** for secure sessions and password encryption.
- **Database Management**: Used **MongoDB** with **Mongoose** for schema design and complex aggregation pipelines.
- **Real-time Messaging**: Integrated **Socket.IO** for real-time message broadcasting and user connectivity.
- **File Uploads**: Handled file uploads with **Multer** and used **Cloudinary** for secure media storage.
- **CRUD Operations**: Built comprehensive CRUD operations for users, messages, and groups.

### Key Features
- **Real-time Messaging**: One-on-one and group chat functionalities with message creation, deletion, and updates.
- **Group Management**: Seamless creation, editing, and management of chat groups.
- **Authentication & Security**: Secure user authentication and password encryption using JWT tokens.
- **Media Sharing**: Image and file sharing capabilities through Cloudinary integration.

## Technologies Used

### Frontend
- React
- Redux
- Tailwind CSS
- React Hook Form

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- Socket.IO

### Others
- JWT for authentication
- Multer for file uploads
- Cloudinary for media storage

## Installation

### Prerequisites
- Node.js installed
- MongoDB instance running locally or in the cloud

### Steps
1. Clone the repository:
   ```bash
   git clone https://github.com/KIRANBADAKURAVA/Chat-APP.git
   cd real-time-chat-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Create a `.env` file in the root directory.
   - Add the following:
     ```env
     MONGO_URI=your_mongodb_uri
     JWT_SECRET=your_jwt_secret
     CLOUDINARY_CLOUD_NAME=your_cloud_name
     CLOUDINARY_API_KEY=your_api_key
     CLOUDINARY_API_SECRET=your_api_secret
     ```

4. Start the server:
   ```bash
   npm run dev
   ```

5. Start the frontend:
   ```bash
   cd client
   npm start
   ```

## Usage
- Navigate to the application in your browser.
- Sign up or log in.
- Start real-time chats with other users.
- Create and manage chat groups.

## Project Structure
```
real-time-chat-app/
├── client/          # Frontend React application          
├── models/          # MongoDB models
├── routes/          # API routes
├── controllers/     # Request handlers
├── middleware/      # Authentication and error handling
└── utils/           # Utility functions
```

## Future Enhancements
- Implement typing indicators and read receipts.
- Add push notifications for new messages.
- Enable video and voice calling features.



---

Feel free to contribute by submitting issues or pull requests to the repository.
