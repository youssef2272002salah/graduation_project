import { Schema, model, Document } from 'mongoose';

export interface IMessage extends Document {
  sender: string;  // User ID of sender
  receiver: string; // User ID of receiver
  room: string;  // Room ID
  content: string;  // Message text
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    sender: { type: String, required: true },
    receiver: { type: String, required: true },
    room: { type: String, required: true },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

export const MessageModel = model<IMessage>('Message', MessageSchema);
