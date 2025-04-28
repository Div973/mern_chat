const express = require("express");
const dotenv = require("dotenv");
const { chats } = require("./data/data");
const connectDB = require("./config/db");
const colors = require("colors");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

dotenv.config();
connectDB();
const app = express();

app.use(express.json()); // to accept json data

app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);


app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(`Server running on PORT ${PORT}...`.yellow.bold)
);

const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:3000",
  },
});

const users = {}; // Object to track users and their online status

io.on("connection", (socket) => {
  console.log("Connected to socket.io");

  socket.on("setup", (userData) => {
    socket.join(userData._id);
    users[userData._id] = true; // Set user as online
    socket.userId = userData._id; // Store user ID for later use
    socket.emit("connected");
    io.emit("onlineUsers", users); // Broadcast updated online users list
  });

  socket.on("disconnect", () => {
    console.log("USER DISCONNECTED");
    if (socket.userId) {
      users[socket.userId] = false; // Set user as offline
      io.emit("onlineUsers", users); // Broadcast updated online users list
    }
  });

  socket.on("getOnlineUsers", () => {
    socket.emit("onlineUsers", users); // Send current online users list to requesting client
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User Joined Room: " + room);
  });

  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", (newMessageReceived) => {
    var chat = newMessageReceived.chat;

    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id === newMessageReceived.sender._id) return;

      socket.in(user._id).emit("message received", newMessageReceived);
    });
  });

  socket.off("setup", () => {
    console.log("USER DISCONNECTED");
    socket.leave(socket.userId);
    if (socket.userId) {
      users[socket.userId] = false; // Update offline status on disconnect
      io.emit("onlineUsers", users); // Emit updated online users list
    }
  });
});
