import express from "express";
import { checkIfUserHasConversation, getConversation, getConversations, sendMessage, startConversation, markeMessageAsRead } from "./handler";


const messagesRouter = express.Router();

messagesRouter.get("/checkIfUserHasConversation/:userId",checkIfUserHasConversation);

messagesRouter.get("/", getConversations);

messagesRouter.get("/:conversationId",getConversation);



messagesRouter.post("/start", startConversation);

messagesRouter.post("/", sendMessage);
messagesRouter.post("/mark-as-read", markeMessageAsRead);


export default messagesRouter;
