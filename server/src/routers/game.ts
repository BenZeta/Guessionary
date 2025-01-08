import { Router } from 'express';
import GameController from '../controllers/GameController';
const router = Router();

router.get('/start/:roomId/:gameId', GameController.startGame);

export default router;
