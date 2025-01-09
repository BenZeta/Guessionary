import express from 'express';
import router from './routers';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { log } from 'console';

interface ServerToClientEvents {
  [event: string]: (...args: unknown[]) => void;
}

type User = {
  id: string;
  username: string;
  avatar: string;
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
  joinRoom: (data: { roomId: string; username: string; avatar: string }) => void;
  leaveRoom: (data: { roomId: string; updatedRoom: Room }) => void;
  userList: (user: { users: User[] }) => void;
  startGame: (data: { roomId: string; gameId: string; users: User[] }) => void;
  submitWords: (data: { roomId: string; username: string; words: string }) => void;
  endRound1: (roomId: string) => void;
}

interface InterServerEvents {
  ping: () => void;
}

interface SocketData {
  name: string;
  age: number;
}

interface PlayerWords {
  username: string;
  words: string;
}

const roomWords: { [roomId: string]: PlayerWords[] } = {}; // Store words for each room

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const app = express();
const port = process.env.PORT || 8080;

const httpServer = createServer(app);
export const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(httpServer, {
  cors: {
    origin: '*',
  },
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({ origin: '*' }));

app.use(router);

io.on('connection', (socket) => {
  // Room creation
  socket.on('roomCreated', (room: Room) => {
    console.log('room has been created', room.id);
    io.emit('roomCreated:server', room);
  });

  // Emit the current room list
  socket.on('roomList', (rooms: Room[]) => {
    io.emit('roomList:server', rooms);
  });

  // Handle joining a room
  socket.on('joinRoom', (data) => {
    console.log(data);

    if (!data.roomId) {
      console.error('No targeted room ID provided');
      return;
    }

    io.emit('joinRoom:server', data);
    socket.join(data.roomId);
    console.log(`User joined room: ${data.roomId}`);
  });

  // Handle leaving a room
  socket.on('leaveRoom', (data) => {
    console.log('leaveRoom event triggered', data.roomId);
    io.emit('leaveRoom:server', data);
    socket.leave(data.roomId);
  });

  // Start game
  socket.on('startGame', (data) => {
    console.log(`Starting game ${data.gameId} in room ${data.roomId}`);
    io.emit('startGame:server', { gameId: data.gameId, roomId: data.roomId, users: data.users });
  });

  // Collect words for Round 1
  socket.on('submitWords', (data: { roomId: string; username: string; words: string }) => {
    if (!roomWords[data.roomId]) {
      roomWords[data.roomId] = [];
    }
    roomWords[data.roomId].push({ username: data.username, words: data.words });
    console.log(`Words submitted for room ${data.roomId}:`, roomWords[data.roomId]);
  });

  // End Round 1 and redistribute words
  socket.on('endRound1', (roomId) => {
    const players = roomWords[roomId];
    if (!players || players.length === 0) {
      console.error(`No words found for room ${roomId}`);
      return;
    }

    // Shuffle words
    const shuffledWords = shuffleArray(players.map((player) => player.words));

    // Assign shuffled words to players
    players.forEach((player, index) => {
      const newWords = shuffledWords[index];
      console.log(newWords, 'newWords');

      io.to(roomId).emit('receiveWords', newWords);
    });

    // Clear words for the room to prepare for the next round
    roomWords[roomId] = [];
    console.log(`Round 1 ended for room ${roomId}`);

    io.emit('endRound1:server', roomId);
  });

  // Handle client disconnection
  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
  });
});

// Utility function to shuffle an array
function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

httpServer.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
