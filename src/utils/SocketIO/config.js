import { Server } from 'socket.io';

let io;

export const initSocket = (server) => {
  io = new Server(server, { cors: { origin: "*" } });
  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io has not been initialized!");
  }
  return io;
};
