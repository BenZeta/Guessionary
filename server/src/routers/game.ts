import { Router } from 'express';
import GameController from '../controllers/GameController';
const router = Router();

router.get('/', GameController.getGames);
router.get('/start/:roomId/:gameId', GameController.startGame);
router.post('/round_1/:roomId/:gameId', GameController.postGameRound1);
router.post('/round_2/:roomId/:gameId', GameController.postGameRound2);
router.get('/word', GameController.getAllWordContribution);
router.post('/guess/:roomId/:gameId', GameController.checkGuess);

export default router;
