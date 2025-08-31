const http = require("http");
const socketio = require("socket.io");
const app = require("./app");
require("dotenv").config();

// Create HTTP server from Express app
const server = http.createServer(app);

// Attach socket.io to server
const io = socketio(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Socket.IO event handling
io.on("connection", (socket) => {
  console.log("New client connected", socket.id);

  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined room ${roomId}`);
  });

  socket.on("sendMessage", ({ roomId, message }) => {
    io.to(roomId).emit("receiveMessage", message);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected", socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, "0.0.0.0", () =>
  console.log(`Server running on port ${PORT}`)
);

// Export (optional)
module.exports = { app, server, io };
