import { Router } from 'express';
import AuthController from '../controllers/AuthController';
import RoomController from '../controllers/RoomController';
import { authentication } from '../middlewares/authentication';
const router = Router();

router.post('/login', AuthController.login);

router.use(authentication);
router.post('/create-room', RoomController.createRoom);

export default router;
