import express from 'express';
import router from './routers';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

interface ServerToClientEvents {
  [event: string]: (...args: unknown[]) => void;
}

type User = {
  id: string;
  username: string;
  avatar: string;
};

type Game = {
  id: string;
  isActive: boolean;
  createdAt: Date;
};

interface Room {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
  createdAt: Date;
  gameId: string;
}

interface ClientToServerEvents {
  hello: () => void;
  roomName: (roomInfo: { roomName: string; username: string }) => void;
  roomList: (rooms: Room[]) => void;
  roomCreated: (room: Room) => void;
  joinRoom: (targetedRoomId: string) => void;
  leaveRoom: (data: { roomId: string; updatedRoom: Room }) => void;
  userList: (user: { users: User[] }) => void;
  startGame: (data: { message: string; game: Game }) => void;
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
  // console.log('A user connected:', socket.id);

  socket.on('roomCreated', (room: Room) => {
    io.emit('roomCreated:server', room);
  });

  // Emit the current room list to the newly connected client
  socket.on('roomList', (rooms: Room[]) => {
    io.emit('roomList:server', rooms);
  });

  // Handle join room
  socket.on('joinRoom', (targetedRoomId) => {
    socket.join(targetedRoomId);
    console.log(`User joined room: ${targetedRoomId}`);
  });

  // Handle leave room && send updated room with users
  socket.on('leaveRoom', (data) => {
    console.log(data.updatedRoom, '<<<<<');

    console.log('leaveRoom event triggered', data.roomId);
    io.emit('leaveRoom:server', data);
    socket.leave(data.roomId);
  });

  // handle start game
  socket.on('startGame', (data: { message: string; game: Game }) => {
    io.emit('startGame:server', data);
  });

  // handle userList
  socket.on('userList', (users) => {
    socket.broadcast.emit('userList:server', users);
  });

  // Handle client disconnection
  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
  });
});

httpServer.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
