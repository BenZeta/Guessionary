import { Router } from 'express';
import AuthController from '../controllers/AuthController';
import RoomController from '../controllers/RoomController';
import { authentication } from '../middlewares/authentication';
import UserController from '../controllers/UserController';
const router = Router();

router.post('/login', AuthController.login);

router.use(authentication);

router.get('/users/:roomId', UserController.getUserByRoom);
router.get('/rooms', RoomController.getRooms);
router.post('/create-room', RoomController.createRoom);
router.patch('/join-room', RoomController.joinRoom);
router.patch('/leave-room', RoomController.leaveRoom);

export default router;
