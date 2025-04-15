import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { ChatService } from './chat.service';

// Define User Interface
interface UserPayload {
  id: string;
  fullname: string;
}

interface AuthenticatedSocket extends Socket {
  user?: UserPayload;
}

export class ChatGateway {
  private io: SocketIOServer;


  constructor(io: SocketIOServer, private chatService: ChatService) {
    this.io = io;
    this.setupMiddleware();
    this.setupListeners();
  }

  // Middleware for Authentication
  private setupMiddleware() {
    this.io.use((socket: AuthenticatedSocket, next) => {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      try {
        if (!process.env.JWT_SECRET) {
          return next(new Error('Authentication error: JWT_SECRET is missing'));
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET) as UserPayload;
        console.log(`🔑 User authenticated: ${decoded.fullname}`);
        socket.user = decoded;
        next();
      } catch (error) {
        return next(new Error('Authentication error: Invalid token'));
      }
    });
  }

  // WebSocket Event Listeners
  private setupListeners() {
    this.io.on('connection', (socket: AuthenticatedSocket) => {
      console.log(`🔌 User connected: ${socket.user?.fullname || 'Unknown'}`);

      socket.on('joinRoom', ({ room }) => {
        socket.join(room);
        console.log(`📢 User joined room: ${room}`);
      });

      socket.on('sendMessage', ({ room, message }) => {
        this.io.to(room).emit('message', { user: socket.user, message });
        // todo: save message to database
        this.chatService.saveMessage(socket.user?.id || '67c4e5dbc5c9afa1589029a0', '67c4e5dbc5c9afa1589029a0', room, message);
      });

      socket.on('typing', ({ room }) => {
        this.io.to(room).emit('typing', { user: socket.user });
      });

      socket.on('messageRead', ({ room }) => {
        this.io.to(room).emit('messageRead', { user: socket.user });
      });

      socket.on('disconnect', () => {
        console.log(`❌ User disconnected: ${socket.user?.fullname || 'Unknown'}`);
      });
    });
  }
}
