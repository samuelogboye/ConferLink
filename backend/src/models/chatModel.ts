import { IMessage } from "@/common/interfaces";
import mongoose, { Schema, Document, Model } from "mongoose";

  interface IChat extends Document {
    roomId: string;
    messages: IMessage[];
  }
  
  const messageSchema = new Schema<IMessage>(
    {
      content: { type: String, required: true },
      author: { type: String },
      timestamp: { type: Number, required: true },
    },
    { _id: false }
  );
  
  const chatSchema = new Schema<IChat>(
    {
      roomId: { type: String, required: true, unique: true },
      messages: { type: [messageSchema], default: [] },
    },
    { timestamps: true }
  );
  
  export const ChatModel: Model<IChat> = mongoose.model<IChat>("Chat", chatSchema);
  