import { Server } from 'socket.io';
import { ENV } from '../config/env.js';

let io = null;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: [ENV.CLIENT_URL, 'http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  io.on('connection', (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id} (Transport: ${socket.conn.transport.name})`);

    // Allow client to subscribe to a specific vehicle room if needed
    socket.on('subscribe:vehicle', (vehicleId) => {
      if (vehicleId) {
        const room = `vehicle:${vehicleId.toUpperCase()}`;
        socket.join(room);
        console.log(`[Socket.IO] Client ${socket.id} joined room: ${room}`);
      }
    });

    socket.on('unsubscribe:vehicle', (vehicleId) => {
      if (vehicleId) {
        const room = `vehicle:${vehicleId.toUpperCase()}`;
        socket.leave(room);
        console.log(`[Socket.IO] Client ${socket.id} left room: ${room}`);
      }
    });

    socket.on('disconnect', (reason) => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id} (Reason: ${reason})`);
    });

    socket.on('error', (err) => {
      console.error(`[Socket.IO] Socket error on ${socket.id}: ${err.message}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO is not initialized! Call initSocket first.');
  }
  return io;
};
