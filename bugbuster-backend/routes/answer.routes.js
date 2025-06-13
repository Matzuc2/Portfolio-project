import express from 'express';
import { 
  getAllAnswers, 
  getAnswerById, 
  getAnswersByQuestionId, 
  createAnswer,
  updateAnswer,
  deleteAnswer 
} from '../controllers/answer.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Routes publiques
router.get('/', getAllAnswers);
router.get('/:id', getAnswerById);
router.get('/question/:questionId', getAnswersByQuestionId);

// Routes protégées (nécessitent authentification)
router.post('/', authenticate, createAnswer);
router.put('/:id', authenticate, updateAnswer);
router.delete('/:id', authenticate, deleteAnswer);

export default router;