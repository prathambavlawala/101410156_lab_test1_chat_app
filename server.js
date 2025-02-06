const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
require('dotenv').config(); // Load environment variables

const app = express();
app.use(cors({ origin: '*' }));

const server = http.createServer(app);
const io = socketIo(server);

// ✅ Connect to MongoDB Atlas
const mongoURI = process.env.MONGO_URI || 'mongodb+srv://bavlawalapratham:U7sbynp37f1JQ0XF@cluster0.mxqbk.mongodb.net/chatBot?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch(err => console.log('❌ MongoDB Atlas Connection Error:', err));

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ✅ MongoDB Schema for Messages
const MessageSchema = new mongoose.Schema({
    from_user: String,
    room: String,
    message: String,
    date_sent: { type: Date, default: Date.now }
});
const Message = mongoose.model('Message', MessageSchema);

// Routes
app.use('/auth', require('./routes/authRoutes'));
app.use('/chat', require('./routes/chatRoutes'));

// ✅ Socket.io logic
io.on('connection', (socket) => {
    console.log('🔗 User connected');

    // ✅ Fetch old messages when a user joins a room
    socket.on('joinRoom', async ({ room, username }) => {
        socket.join(room);
        console.log(`📌 ${username} joined room: ${room}`);

        // ✅ Fetch last 50 messages from MongoDB Atlas
        const messages = await Message.find({ room }).sort({ date_sent: 1 }).limit(50);
        socket.emit('loadMessages', messages);

        // ✅ Notify room that a user joined
        const joinMessage = { from_user: 'System', room, message: `📢 **${username}** joined the **${room}** room!` };
        io.to(room).emit('message', joinMessage);
        await new Message(joinMessage).save();
    });

    // ✅ Handle Chat Messages
    socket.on('chatMessage', async (msg) => {
        console.log(`📩 Message received in ${msg.room}: ${msg.message}`);

        // ✅ Save user message to MongoDB Atlas
        await new Message(msg).save();
        io.to(msg.room).emit('message', msg);

        // ✅ Check if chatbot should respond
        const botResponse = getChatbotResponse(msg.message);
        if (botResponse) {
            setTimeout(async () => {
                const botMessage = { from_user: 'ChatBot 🤖', room: msg.room, message: botResponse };
                io.to(msg.room).emit('message', botMessage);
                await new Message(botMessage).save();
            }, 1000);
        }
    });

    
   socket.on('typing', ({ room, username }) => {
    io.to(room).emit('typing', { username }); 
});

socket.on('stopTyping', (room) => { 
    io.to(room).emit('stopTyping'); 
});



    socket.on('disconnect', () => {
        console.log('❌ User disconnected');
    });
});

// ✅ Function to Get Chatbot Response
function getChatbotResponse(userMessage) {
    const responses = {
        "hello": "Hello! How can I assist you today?",
        "hi": "Hi there! 😊",
        "how are you": "I'm just a bot, but I'm doing great! 🚀",
        "help": "You can ask me anything! Try 'hello', 'bye', or 'who are you'!",
        "bye": "Goodbye! Have a great day! 👋",
        "who are you": "I'm a chatbot created to assist you!"
    };

    userMessage = userMessage.toLowerCase().trim();
    return responses[userMessage] || null;
}

// ✅ Start Server
server.listen(3000, () => {
    console.log('🚀 Server running on http://localhost:3000');
});
