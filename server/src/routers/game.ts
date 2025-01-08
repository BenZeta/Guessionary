import { Router } from 'express';
import GameController from '../controllers/GameController';
const router = Router();

router.get('/start/:roomId', GameController.startGame);

export default router;
