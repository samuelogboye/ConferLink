import mongoose, { Schema, Document, Model } from "mongoose";

interface IUser {
  peerId: string;
  userName: string;
}

interface IRoom extends Document {
  roomId: string;
  createdBy: string;
  participants: IUser[];
}

const userSchema = new Schema<IUser>(
  {
    peerId: { type: String, required: true },
    userName: { type: String, required: true },
  },
  { _id: false } // Prevents automatic generation of _id for subdocuments
);

const roomSchema = new Schema<IRoom>(
  {
    roomId: { type: String, required: true, unique: true },
    createdBy: { type: String, required: true },
    participants: { type: [userSchema], default: [] },
  },
  { timestamps: true }
);

export const RoomModel: Model<IRoom> = mongoose.model<IRoom>("Room", roomSchema);
