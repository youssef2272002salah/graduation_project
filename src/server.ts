import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import app from './app'; // Import Express app
import dbConnect from './config/database';
import { Server as SocketIOServer } from 'socket.io';
import { ChatGateway } from './modules/chat/chat.gateway';
import { ChatService } from './modules/chat/chat.service';

// Connect to Database
dbConnect();

const PORT = process.env.PORT || 3001; // Ensure frontend connects to this port

// Create HTTP Server
const httpServer = http.createServer(app);

// Initialize Socket.IO
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: '*', // Allow frontend access
    methods: ['GET', 'POST'],
  },
});

// Initialize Chat Gateway
const chatService = new ChatService();
new ChatGateway(io, chatService);

// Start Server
httpServer.listen(PORT, () => {
  console.log(`🚀 HTTP Server with WebSocket running on port ${PORT}`);
});

export { io };
