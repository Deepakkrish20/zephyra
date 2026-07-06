import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'https://zephyra-ku4d.onrender.com';

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  reconnectionAttempts: 5,
});

export default socket;
