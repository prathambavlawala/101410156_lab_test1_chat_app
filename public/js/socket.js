const socket = io();

socket.on('connect', () => {
    console.log('✅ Connected to server');
});

function joinRoom(room) {
    socket.emit('joinRoom', room);
}

function sendMessage(room, message) {
    socket.emit('chatMessage', { room, message });
}

socket.on('message', (msg) => {
    console.log(`📩 New message: ${msg.message}`);
});
