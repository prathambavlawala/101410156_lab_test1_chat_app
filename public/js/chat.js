$(document).ready(() => {
    const socket = io();
    let room = '';

    function joinRoom() {
        room = $('#room').val();
        socket.emit('joinRoom', room);
        $('#messages').empty(); // Clear old messages
        $.get(`/chat/messages/${room}`, (messages) => {
            messages.forEach(msg => {
                $('#messages').append(`<p><strong>${msg.from_user}:</strong> ${msg.message}</p>`);
            });
        });
    }

    function sendMessage() {
        const message = $('#message').val();
        if (room && message) {
            socket.emit('chatMessage', { room, message });
            $('#message').val('');
        }
    }

    socket.on('message', (msg) => {
        $('#messages').append(`<p><strong>${msg.from_user || 'Anonymous'}:</strong> ${msg.message}</p>`);
    });

    // Typing Indicator
    $('#message').on('input', () => {
        socket.emit('typing', room);
    });

    socket.on('typing', (userId) => {
        $('#typing-indicator').text('User is typing...');
        setTimeout(() => $('#typing-indicator').text(''), 2000);
    });

    // Event listeners
    $('#join-btn').click(joinRoom);
    $('#send-btn').click(sendMessage);
});
