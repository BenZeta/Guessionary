import express from 'express';
import router from './routers';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

// Global error handler for uncaught exceptions
process.on('uncaughtException', (err, origin) => {
  console.error('Uncaught Exception:', err);
  console.error('Exception origin:', origin);
  // Optionally, exit the process gracefully
  process.exit(1);
});

// Global error handler for unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Optionally, exit the process gracefully
  process.exit(1);
});

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
  guessRound3: (data: { roomId: string; guesser: string; guess: string }) => void;
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
    console.log(room, '<<<<<');

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
    const { roomId, user } = data;

    // Validate room and user data
    if (!roomId || !user || !user.username) {
      console.error('Invalid room or user data:', data);
      return;
    }

    console.log(`User "${user.username}" is attempting to join room "${roomId}"`);

    // Initialize room's player list if it doesn't exist
    if (!players[roomId]) {
      players[roomId] = [];
    }

    // Check if the user already exists in the room
    const userExists = players[roomId].some((player) => player.name === user.username);

    if (userExists) {
      console.warn(`User "${user.username}" is already in room "${roomId}"`);
      return;
    }

    // Add user to the room's player list
    players[roomId].push({
      name: user.username,
      avatar: user.avatar,
      role: user.role,
      socketId: socket.id, // Save socket ID
      words: [],
      drawing: [],
    });

    // Emit the join event to all clients
    io.emit('joinRoom:server', { roomId, user });

    console.log(`User "${user.username}" has joined room "${roomId}"`);
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
    roomWords[data.roomId].push({
      username: data.username,
      words: data.words,
      socketId: socket.id,
    });
    console.log(`Words submitted for room ${data.roomId}:`, roomWords[data.roomId]);
  });

  // // End Round 1 and redistribute words
  // socket.on('endRound1', (data: { roomId: string; gameId: string; users: User[] }) => {
  //   console.log(data, 'di end round 1 data');
  //   const players = roomWords[data.roomId];

  //   io.emit('endRound1:server', data);

  //   if (!players || players.length === 0) {
  //     console.error(`No words found for room ${data.roomId}`);
  //     return;
  //   }

  //   // Shuffle words for all players
  //   const allWords = players.flatMap((player) => player.words); // Gabungkan semua kata
  //   const shuffledWords = shuffleArray(allWords); // Acak semua kata

  //   players.forEach((player, index) => {
  //     const startIndex = index * Math.floor(shuffledWords.length / players.length);
  //     const endIndex = startIndex + Math.floor(shuffledWords.length / players.length);
  //     const assignedWords = shuffledWords.slice(startIndex, endIndex); // Ambil subset kata

  //     const socket = io.sockets.sockets.get(player.socketId);
  //     if (socket) {
  //       // console.log(`Player ${player.username} has a valid socket. Emitting...`);
  //       io.to(player.socketId).emit('receiveWords', { words: assignedWords });
  //     } else {
  //       console.error(`Player ${player.username} has an invalid or disconnected socketId: ${player.socketId}`);
  //     }

  //     console.log(`Assigned words to player ${player.username}:`, assignedWords);
  //   });

  //   // Clear words for the room to prepare for the next round

  //   console.log(`Round 1 ended for room ${data.roomId}`);
  // });

  socket.on('endRound1', (data: { roomId: string; gameId: string; users: User[] }) => {
    const players = roomWords[data.roomId];

    if (!players || players.length === 0) {
      console.error(`No words found for room ${data.roomId}`);
      return;
    }

    io.emit('endRound1:server', data);

    // Shuffle words for all players
    const shuffledPlayers = shuffleArray(players); // Shuffle players for random word assignment

    const assignments: PlayerWords[] = [];

    players.forEach((player, index) => {
      const assignTo = shuffledPlayers[index]; // Get the shuffled player for assignment

      console.log(`Assigning words from ${assignTo.username} to ${player.username}:`, assignTo.words);

      assignments.push({
        username: player.username,
        words: assignTo.words, // Ensure this is the full string
        socketId: player.socketId,
      });

      const socket = io.sockets.sockets.get(player.socketId);
      if (socket) {
        io.to(player.socketId).emit('receiveWords', { words: assignTo.words });
      } else {
        console.error(`Player ${player.username} has an invalid or disconnected socketId: ${player.socketId}`);
      }

      console.log(`Assigned words from ${assignTo.username} to ${player.username}`);
    });

    // Save assignments to the roomWords for future use
    roomWords[data.roomId] = assignments;

    console.log(`Round 1 ended for room ${data.roomId}`);
  });

  socket.on('guessRound3', (data: { roomId: string; guesser: string; guess: string }) => {
    const assignments = roomWords[data.roomId];

    if (!assignments) {
      console.error(`No assignments found for room ${data.roomId}`);
      return;
    }

    // Find the original submitter
    const assignment = assignments.find((assignment) => assignment.username === data.guesser);
    if (!assignment) {
      console.error(`No assignment found for guesser ${data.guesser}`);
      return;
    }
    const { username: submitter, words } = assignment;

    // Check if the guess matches any of the original submitter's words
    const isCorrect = words.includes(data.guess);

    console.log(`Guesser ${data.guesser} guessed "${data.guess}". Is correct: ${isCorrect}`);

    // Notify players of the result
    io.emit('guessResult:server', { guesser: data.guesser, isCorrect, submitter });
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
      console.log('Round 2 ended for room', data.roomId);

      const playersInRoom = roomWords[data.roomId];
      // console.log(playersInRoom, 'end round 2 server');
      io.emit('endRound2:server', { roomId: data.roomId, gameId: data.gameId });

      // Ensure that `user64` data is correctly assigned for each player

      // const allUser64 = playersInRoom.map((player) => player.words); // Get all user64 data from players
      // const shuffledUser64 = shuffleArray(allUser64);
      // console.log(allUser64, ' didalam try catch');
      console.log('HALOO IN SERVER');

      // Split the shuffled data and distribute it to players
      // playersInRoom.forEach((player, index) => {
      //   console.log(player.socketId, 'endRound2 in server socketId player');

      //   const user64 = shuffledUser64[index]; // Get the shuffled user64 for this player

      //   const socket = io.sockets.sockets.get(player.socketId);
      //   if (socket) {
      //     console.log(`Player ${player.username} has a valid socket in round 2 with socket id ${player.socketId}. Emitting...`);

      //     io.to(player.socketId).emit('receiveUser64', user64);
      //   } else {
      //     console.error(`Player ${player.username} has an invalid or disconnected socketId: ${player.socketId}`);
      //   }
      //   console.log(`Sent user64 data to player ${player.username}:`, user64);
      // });

      console.log(`Round 2 ended for room ${data.roomId} and data has been redistributed.`);
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
  if (array.length <= 1) return array; // If there's only one or no element, return as is.

  let shuffledArray: T[];
  do {
    shuffledArray = [...array]; // Create a copy of the array to shuffle
    for (let i = shuffledArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
    }
  } while (shuffledArray.every((item, index) => item === array[index]));

  return shuffledArray;
}

httpServer.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
