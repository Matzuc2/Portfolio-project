import express from 'express';
import { 
  getAllVotes, 
  getVoteById, 
  getVotesByQuestionId, 
  getVotesByAnswerId, 
  voteQuestion,
  voteAnswer,
  deleteVote 
} from '../controllers/vote.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Routes publiques (lecture seule)
router.get('/', getAllVotes);
router.get('/:id', getVoteById);
router.get('/questions/:questionId', getVotesByQuestionId);
router.get('/answers/:answerId', getVotesByAnswerId);

// Routes protégées (nécessitent authentification)
router.post('/questions', authenticate, voteQuestion);
router.post('/answers', authenticate, voteAnswer);
router.delete('/:id', authenticate, deleteVote);

export default router;