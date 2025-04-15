import { Request, Response, Router } from 'express';
import { ChatService } from './chat.service';
import expressAsyncHandler from 'express-async-handler';

const chatService = new ChatService();

export class ChatController {
  getMessages = expressAsyncHandler(async (req: Request, res: Response) => {
    const { room } = req.params;
    const messages = await chatService.getMessages(room);
    res.json(messages);
  });
}


