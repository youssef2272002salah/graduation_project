import { Router } from 'express';
import { ChatController } from './chat.controller';
const chatRouter = Router();
const chatController = new ChatController();

chatRouter.get('/:room/messages',chatController.getMessages);

export { chatRouter };
