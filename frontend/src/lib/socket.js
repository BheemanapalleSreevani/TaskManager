import { io } from 'socket.io-client';

// Get backend URL
const backendUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

export const socket = io(backendUrl, {
  autoConnect: false,
  withCredentials: true,
});
