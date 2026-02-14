import { Response } from "express";

import { ConversationRepository } from "./Conversation/cnversation.repository";
import { HttpError } from "../../../../utils/httpError";
import { conversationSchema } from "./Conversation/conversation.schema";
import { MessageRepository } from "./Conversation/message.repository";
import { messageSchema } from "./Conversation/message.schema";
import { Types } from "mongoose";



export const getConversations = async (req: any, res: Response) => {
  try {
    const conversationRepository = new ConversationRepository(
      req.connectionKey,
      conversationSchema,
      "Conversation"
    );
    const conversations = await conversationRepository.findAllConversations();
    res.status(200).json({ conversations });
  } catch (error: any) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

export const getConversation = async (req: any, res: Response) => {
  try {
    const { conversationId } = req.params;
    if (!conversationId) {
      throw new HttpError(400, "conversationId");
    }

    const conversationRepository = new ConversationRepository(
      req.connectionKey,
      conversationSchema,
      "Conversation"
    );
    const conversation = await conversationRepository.findConversation(conversationId, [
      { path: "messages", populate: { path: "senderId", select: "name email image" } },
      { path: "userId", select: "name email" } // Assuming userId is also a reference to User
    ]);
    if (!conversation) {
      throw new HttpError(404, "Conversation not found");
    }
    res.status(200).json({ conversation });
  } catch (err: any) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

export const startConversation = async (req: any, res: Response) => {
  try {
    const { userId, checkingIFConversationExists } = req.body; // User starts chat
    if (!userId) {
      throw new HttpError(400, "userId is required");
    }
    const conversationRepository = new ConversationRepository(
      req.connectionKey,
      conversationSchema,
      "Conversation"
    );

    let conversation = await conversationRepository.findConversationByUserId(userId, [{ path: "messages", populate: { path: "senderId", select: "name email image" } }]);
    if (!conversation && !checkingIFConversationExists) {
      conversation = await conversationRepository.startConversation(userId);
    }
    res.status(200).json({ conversation });
  } catch (error: any) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

export const sendMessage = async (req: any, res: Response) => {
  try {
    const { conversationId, senderId, text } = req.body;
    const conversationRepository = new ConversationRepository(
      req.connectionKey,
      conversationSchema,
      "Conversation"
    );
    const conversation = await conversationRepository.findConversation(conversationId, []);

    if (!conversation) {
      throw new HttpError(400, "Conversation not found");
    }

    const messgaeRepository = new MessageRepository(
      req.connectionKey,
      conversationSchema,
      "Message"
    );


    const message = await messgaeRepository.sendMessage(senderId, text, conversationId);
    if (message) {
      await conversationRepository.updateConversationById(conversationId, message);
    }
    res.status(200).json({ message, success: true });
  } catch (error: any) {
    console.log(error.message);
    res.status(500).json({ message: error.message, success: false });
  }
};


export const checkIfUserHasConversation = async (req: any, res: Response) => {
  try {
    const { userId } = req.params; // User starts chat
    if (!userId) {
      throw new HttpError(400, "userId is required");
    }
    const conversationRepository = new ConversationRepository(
      req.connectionKey,
      conversationSchema,
      "Conversation"
    );



    let conversation: any = await conversationRepository.findConversationByUserId(userId, ["messages"]);
    console.log("conversation", conversation.userId)
    let unreadMessages = 0;
    if (conversation) {
      const messageRepository = new MessageRepository(
        req.connectionKey,
        conversationSchema,
        "Message"
      );
      unreadMessages = await messageRepository.getUnReadMessages(conversation._id, userId);
      console.log("Unread Messages:", unreadMessages);
    }

    conversation = conversation?._id;
    res.status(200).json({ conversation, unreadMessages });
  } catch (error: any) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

export const markeMessageAsRead = async (req: any, res: Response) => {
  try {
    const { conversationId, userId } = req.body;
    if (!conversationId) {
      throw new HttpError(400, "conversationId is required");
    }
    const messageRepository = new MessageRepository(
      req.connectionKey,
      conversationSchema,
      "message"
    );
    await messageRepository.markMessagesAsRead(conversationId, userId);

    res.status(200).json({ success: true, message: "Messages marked as read" });
  } catch (error: any) {
    console.log(error.message);
    res.status(500).json({ message: error.message, success: false });
  }
};
