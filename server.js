const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Vite default port
    methods: ["GET", "POST"]
  }
});


// Serve static frontend files (for testing)
app.use(express.static(path.join(__dirname, 'public')));

// WebSocket logic
io.on('connection', (socket) => {
    console.log('🟢 New user connected:', socket.id);

    // Join a specific room (chat)
    socket.on('join-room', ({ roomId, username }) => {
        socket.join(roomId);
        console.log(`📥 ${username} joined room: ${roomId}`);
        socket.to(roomId).emit('user-joined', { username });
    });

    // Receive and send message to room
    socket.on('chat-message', ({ roomId, message, sender }) => {
        io.to(roomId).emit('chat-message', {
            message,
            sender,
            timestamp: new Date()
        });
    });

    // Typing indicator
    socket.on('typing', ({ roomId, sender }) => {
        socket.to(roomId).emit('typing', { sender });
    });

    // Disconnect
    socket.on('disconnect', () => {
        console.log('🔴 User disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
