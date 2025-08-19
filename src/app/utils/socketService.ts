import { Types } from "mongoose";
import { Server } from "socket.io";
import { Message } from "../modules/message/message.model";
import User from "../modules/user/user.model";

//map to store online users ->userId,socketId
const onlineUsers = new Map();

//Map to track typing status-> userId ->[conversation]:boolean
const typingUsers = new Map();

const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    },
    pingTimeout: 60000, //disconnect inactive user or socket after 60s
  });

  //when a new socket connextion established
  io.on("connection", (socket) => {
    console.log(`user connected:${socket.id}`);

    let userId: string | Types.ObjectId | null = null;

    //handle user connection and mark them online in DB

    socket.on("user_connected", async (connectingUserId) => {
      try {
        userId = connectingUserId;
        onlineUsers.set(userId, socket.id);
        if (!userId) {
          throw new Error("User not found");
        }
        socket.join(userId); //join a personal room for direct emit

        //update user status in db
        await User.findByIdAndUpdate(userId, {
          isonline: true,
          lastSeen: new Date(),
        });

        //notify all user that this user is now online
        io.emit("user_status", { userId, isOnline: true });
      } catch (error) {
        console.error("Error handleling user connection", error);
      }
    });

    //Return online status of requested user

    socket.on("get_user_status", (requestedUserId, callback) => {
      const isOnline = onlineUsers.has(requestedUserId);
      callback({
        userId: requestedUserId,
        isOnline,
        lastSeen: isOnline ? new Date() : null,
      });
    });

    //forword massage to receiver if online

    socket.on("send_message", async (message) => {
      try {
        const receiverSocketId = onlineUsers.get(message.receiver?._id);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("receive_message", message);
        }
      } catch (error) {
        console.error("Error sending Message", error);
        socket.emit("message_error", { error: "failed to send message" });
      }
    });

    //update message as read and notify sender

    socket.on("message_read", async ({ messageIds, senderId }) => {
      try {
        await Message.updateMany(
          { _id: { $in: messageIds } },
          { $set: { messageStatus: "read" } }
        );
        const senderSocketId = onlineUsers.get(senderId);
        if (senderSocketId) {
          messageIds.forEach((messageId: string) => {
            io.to(senderSocketId).emit("message_status_update", {
              messageId,
              messageStatus: "read",
            });
          });
        }
      } catch (error) {}
    });

    //handle typing start event and auto stop
    socket.on("writing_start", ({ conversationId, receiverId }) => {
      if (!userId || !receiverId || !conversationId) return;
    });
  });
};
