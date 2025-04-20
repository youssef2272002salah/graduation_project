import { MessageModel } from './chat.shcema';
    
    export class ChatService {
        async saveMessage(sender: string, receiver: string, room: string, content: string) {
            return MessageModel.create({ sender, receiver, room, content });
          }
        
          async getMessages(room: string) {
            return MessageModel.find({ room }).sort({ createdAt: -1 }).limit(50);
          }
}