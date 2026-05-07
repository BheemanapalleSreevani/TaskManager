import { io } from 'socket.io-client';

// Get backend URL
const backendUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://taskmanager-ecwq.onrender.com';

export const socket = io(backendUrl, {
  autoConnect: false,
  withCredentials: true,
});
