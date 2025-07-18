import express from 'express';
import { 
  getAllQuestions, // ADD THIS
  getQuestionById, 
  createQuestion, 
  updateQuestion, 
  deleteQuestion, 
  getAnswersByQuestionId 
} from '../controllers/question.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Routes publiques
router.get('/', getAllQuestions); // ADDED THIS ROUTE
router.get('/:id', getQuestionById);
router.get('/:questionId/answers', getAnswersByQuestionId);

// Routes protégées (nécessitent authentification)
router.post('/', authenticate, createQuestion);
router.put('/:id', authenticate, updateQuestion);
router.delete('/:id', authenticate, deleteQuestion);

export default router;

