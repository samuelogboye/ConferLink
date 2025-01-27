import { IMessage } from "@/common/interfaces";
import { ChatModel, RoomModel } from "@/models";
import { Socket } from "socket.io";
import { v4 as uuidV4 } from "uuid";

export const roomHandler = (socket: Socket) => {
  const createRoom = async ({ userId }: { userId: string }) => {
    const roomId = uuidV4();

    // Create a new room in the database
    await RoomModel.create({
      roomId,
      createdBy: userId,
      participants: [],
    });

    socket.emit("room-created", { roomId });
    console.log(`User ${userId} created the room ${roomId}`);
  };

  const joinRoom = async ({
    roomId,
    peerId,
    userName,
  }: {
    roomId: string;
    peerId: string;
    userName: string;
  }) => {
    const room = await RoomModel.findOne({ roomId });
    if (!room) {
      socket.emit("error", { message: "Room not found" });
      return;
    }

    // Add the user to the participants
    room.participants.push({ peerId, userName });
    await room.save();

    // Find or create a chat for the room
    const chat = await ChatModel.findOneAndUpdate(
      { roomId },
      { $setOnInsert: { roomId, messages: [] } },
      { upsert: true, new: true }
    );

    socket.emit("get-messages", chat?.messages || []);
    console.log(`User joined the room: ${roomId}`, peerId, userName);

    socket.join(roomId);
    socket.to(roomId).emit("user-joined", { peerId, userName });

    socket.emit("get-users", {
      roomId,
      participants: room.participants,
    });

    socket.on("disconnect", async () => {
      console.log("User left the room:", peerId);

      // Remove the user from the room's participants
      await RoomModel.updateOne(
        { roomId },
        { $pull: { participants: { peerId } } }
      );
      socket.to(roomId).emit("user-disconnected", peerId);
    });
  };

  const addMessage = async (roomId: string, message: IMessage) => {
    console.log({ message });

    // Add the message to the room's chat
    await ChatModel.updateOne(
      { roomId },
      { $push: { messages: message } },
      { upsert: true }
    );

    socket.to(roomId).emit("add-message", message);
  };

  socket.on("create-room", createRoom);
  socket.on("join-room", joinRoom);
  socket.on("send-message", addMessage);
};
