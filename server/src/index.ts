import express from 'express';
import router from './routers';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

interface ServerToClientEvents {
  [event: string]: (...args: any[]) => void;
}

interface ClientToServerEvents {
  hello: () => void;
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
app.use(cors());

app.use(router);

io.on('connection', (socket) => {
  // console.log('a user connected', socket.id);
  socket.emit('welcome', 'Hello World!');
});

app.post('/test-socket', (req, res) => {
  const { eventName, data } = req.body;
  io.emit(eventName, data); // Emit the event to all connected clients
  res.send({ success: true, message: `Emitted ${eventName}` });
});

httpServer.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
