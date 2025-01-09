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
  role: string;
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
  joinRoom: (data: { roomId: string; user: User }) => void;
  leaveRoom: (data: { roomId: string; updatedRoom: Room }) => void;
  userList: (user: { users: User[] }) => void;
  startGame: (data: { roomId: string; gameId: string; users: User[] }) => void;
  submitWords: (data: { roomId: string; username: string; words: string }) => void;
  endRound1: (data: { roomId: string; gameId: string; users: User[] }) => void;
  endRound2: (data: { roomId: string; gameId: string; user64: string }) => void;
  newUser: (user: User) => void;
  submitDataRound2: (data: { roomId: string; gameId: string; user64: string }) => void;
}

interface InterServerEvents {
  ping: () => void;
}

interface SocketData {
  name: string;
  age: number;
}

type Player = {
  name: string;
  socketId: string;
  drawing: string[];
  words: string[];
  avatar: string;
  role: string;
};

type Players = {
  [roomId: string]: Player[];
};

interface PlayerWords {
  username: string;
  words: string;
  socketId: string;
}

let roomWords: { [roomId: string]: PlayerWords[] } = {}; // Store words for each room
let players: Players = {}; // Objek untuk menyimpan data pemain berdasarkan room

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

  socket.on('newUser', (newUser: User) => {
    console.log('new user has joined');

    io.emit('newUser:server', newUser);
  });

  socket.on('joinRoom', (data: { roomId: string; user: User }) => {
    console.log(data.user, '<<<<<<<');

    if (!players[data.roomId]) {
      players[data.roomId] = [];
    }

    players[data.roomId].push({
      name: data?.user?.username,
      avatar: data?.user?.avatar,
      role: data?.user?.role,
      socketId: socket.id, // Simpan socket.id
      words: [],
      drawing: [], // Kata-kata untuk pemain ini
    });

    io.emit('joinRoom:server', { roomId: data.roomId, user: data.user });

    console.log(`${data?.user?.username} joined room ${data.roomId}`);
  });

  // Handle leaving a room
  socket.on('leaveRoom', (data) => {
    console.log('leaveRoom event triggered', data.roomId);
    io.emit('leaveRoom:server', data);
    socket.leave(data.roomId);
  });

  // Start game
  socket.on('startGame', (data) => {
    console.log(`Starting game ${data.gameId} in room ${data.roomId} with users ${JSON.stringify(data.users)}`);
    io.emit('startGame:server', { gameId: data.gameId, roomId: data.roomId, users: data.users });

    // Start a 15-second timer for Round 1
    setTimeout(() => {
      io.emit('endRound1:server', { roomId: data.roomId, gameId: data.gameId, users: data.users });
    }, 15000);
  });

  // Collect words for Round 1
  socket.on('submitWords', (data: { roomId: string; username: string; words: string }) => {
    if (!roomWords[data.roomId]) {
      roomWords[data.roomId] = [];
    }
    roomWords[data.roomId].push({ username: data.username, words: data.words, socketId: socket.id });
    console.log(`Words submitted for room ${data.roomId}:`, roomWords[data.roomId]);
  });

  // End Round 1 and redistribute words
  socket.on('endRound1', (data: { roomId: string; gameId: string; users: User[] }) => {
    console.log(data, 'di end round 1 data');
    const players = roomWords[data.roomId];

    console.log(players, 'di end round 1 players');

    io.emit('endRound1:server', data);

    if (!players || players.length === 0) {
      console.error(`No words found for room ${data.roomId}`);
      return;
    }

    // Shuffle words for all players
    const allWords = players.flatMap((player) => player.words); // Gabungkan semua kata
    const shuffledWords = shuffleArray(allWords); // Acak semua kata

    players.forEach((player, index) => {
      const startIndex = index * Math.floor(shuffledWords.length / players.length);
      const endIndex = startIndex + Math.floor(shuffledWords.length / players.length);
      const assignedWords = shuffledWords.slice(startIndex, endIndex); // Ambil subset kata

      const socket = io.sockets.sockets.get(player.socketId);
      if (socket) {
        // console.log(`Player ${player.username} has a valid socket. Emitting...`);
        io.to(player.socketId).emit('receiveWords', { words: assignedWords });
      } else {
        console.error(`Player ${player.username} has an invalid or disconnected socketId: ${player.socketId}`);
      }

      console.log(`Assigned words to player ${player.username}:`, assignedWords);
    });

    // Clear words for the room to prepare for the next round

    console.log(`Round 1 ended for room ${data.roomId}`);
  });

  socket.on('submitDataRound2', (data: { roomId: string; gameId: string; user64: string }) => {
    const playersInRoom = roomWords[data.roomId];

    if (!playersInRoom || playersInRoom.length === 0) {
      console.error(`No players found in room ${data.roomId}`);
      return;
    }

    playersInRoom.forEach((player) => {
      player.words = data.user64;
    });

    socket.on('endRound2', (data: { roomId: string; gameId: string }) => {
      // Get players in the room
      const playersInRoom = roomWords[data.roomId];
      console.log(playersInRoom);

      if (!playersInRoom || playersInRoom.length === 0) {
        console.error(`No players found in room ${data.roomId}`);
        return;
      }

      // Ensure that `user64` data is correctly assigned for each player
      const allUser64 = playersInRoom.flatMap((player) => player.words); // Get all user64 data from players
      const shuffledUser64 = shuffleArray(allUser64);

      // Split the shuffled data and distribute it to players
      playersInRoom.forEach((player, index) => {
        const user64 = shuffledUser64[index]; // Get the shuffled user64 for this player

        const socket = io.sockets.sockets.get(player.socketId);
        if (socket) {
          console.log(`Player ${player.username} has a valid socket in round 2. Emitting...`);

          io.to(player.socketId).emit('receiveUser64', user64);
        } else {
          console.error(`Player ${player.username} has an invalid or disconnected socketId: ${player.socketId}`);
        }
        console.log(`Sent user64 data to player ${player.username}:`, user64);
      });

      console.log(`Round 2 ended for room ${data.roomId} and data has been redistributed.`);
      io.emit('endRound2:server', { roomId: data.roomId, gameId: data.gameId });
    });
  });

  // Handle client disconnection
  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
    players = {};
    roomWords = {};
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
