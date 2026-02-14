import app from "./app";
import http from "http";
import { Server } from "socket.io";


require("dotenv").config();

const server = http.createServer(app);
const clientOrigin = process.env.SOCKET_ORIGIN_CLIENT!;
const superOrigin = process.env.SOCKET_ORIGIN_SUPER!;

const io = new Server(server, {
  cors: {
    origin: [clientOrigin, superOrigin], // Change this to your frontend URL
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  const { tenant } = socket.handshake.auth;

  console.log(`✅ User connected: ${socket.id}`);

  socket.on("joinConversation", (conversationId) => {
    socket.join(conversationId);
    console.log(`User joined conversation: ${conversationId}`);
  });

  socket.on("sendMessage", async (messageData, callback) => {
    try {
      const res = await fetch(`${process.env.SERVER_DOMAIN}/api/v1/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${messageData.token}`,
          "Content-Type": "application/json",
          "x-connection-key": tenant
        },
        body: JSON.stringify(messageData),
      });
      const data = await res.json();
      if (data.success) {
        callback(data.message);
        io.to(messageData.conversationId).emit("receiveMessage", data.message);
      }
    } catch (error) {
      console.error("Error saving message:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log(`❌ User disconnected: ${socket.id}`);
  });
});
// Initialize WebSocket server
// setupEditorWebSocketServer(server);
server.listen(process.env.PORT || 8001, () => {
  console.log(`Server is running on port ${process.env.PORT || +"-" + 8001}`);
});
