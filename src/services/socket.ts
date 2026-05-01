import { io } from "socket.io-client";

// In Vercel/Serverless environments, Socket.io doesn't work out of the box.
// We initialize it only if we're not in a typical serverless environment
// or we just handle the connection error gracefully.
const socket = io(window.location.origin, {
    transports: ['websocket', 'polling'], // Allow polling as fallback
    reconnectionAttempts: 3,
    timeout: 5000
});

socket.on('connect_error', (err) => {
    console.warn("Socket connection error (expected in some serverless environments):", err.message);
});

export default socket;
