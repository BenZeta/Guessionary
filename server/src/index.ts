import express from 'express';
import router from './routers';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

interface ServerToClientEvents {
  [event: string]: (...args: any[]) => void;
}

interface Room {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
  createdAt: Date;
  gameId: string;
  // Add other properties as needed
}

interface ClientToServerEvents {
  hello: () => void;
  roomName: (roomInfo: { roomName: string; username: string }) => void;
  roomList: (rooms: Room[]) => void;
  roomCreated: (room: Room) => void;
  joinRoom: (targetedRoomId: string) => void;
}

interface InterServerEvents {
  ping: () => void;
}

interface SocketData {
  name: string;
  age: number;
}

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const app = express();
const port = process.env.PORT || 8080;

const httpServer = createServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(httpServer, {
  cors: {
    origin: '*',
  },
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({ origin: '*' }));

app.use(router);

io.on('connection', (socket) => {
  socket.on('roomCreated', (room: Room) => {
    io.emit('roomCreated:server', room);
  });

  // Emit the current room list to the newly connected client
  socket.on('roomList', (rooms: Room[]) => {
    io.emit('roomList:server', rooms);
  });

  socket.on('joinRoom', (targetedRoomId: string) => {
    socket.join(targetedRoomId);
  });

  // Handle client disconnection
  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
  });
});

httpServer.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
