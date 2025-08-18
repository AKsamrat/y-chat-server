//get all conversation

import { Conversation } from "./conv.model";

export const getConversation = async (userId: string) => {
  // Find all conversations where the user is a participant
  const conversations = await Conversation.find({ participants: userId })
    .populate("participants", "username profilePicture isOnline lastSeen")
    .populate({
      path: "lastMessage",
      populate: {
        path: "sender receiver",
        select: "username profilePicture",
      },
    })
    .sort({ updatedAt: -1 });

  return conversations;
};

export const ConversationService = {
  getConversation,
};
