let connected = false;

let socket = io('http://localhost:3010');
socket.emit('setup', userLoggedIn);

socket.on('connected', () => {
    connected = true;
});

socket.on('message received', (newMessage) => {
    messageReceived(newMessage);
});