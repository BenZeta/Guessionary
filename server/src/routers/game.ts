import { Router } from 'express';
import GameController from '../controllers/GameController';
const router = Router();

router.get('/start/:roomId/:gameId', GameController.startGame);
router.post('/post-url/round_2/:gameId', GameController.postGameRound2);

export default router;
