// src/lib/socket.ts
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'https://pro-licious-be.vercel.app';

let socket: Socket | null = null;

export const getSocket = (token?: string): Socket => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      auth: token ? { token } : {},
      transports: ['websocket'],
    });
  } else if (token) {
    socket.auth = { token };
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
