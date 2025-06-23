import express from 'express';
import { 
  getAllAnswers,
  getAnswerById,
  getAnswersByQuestionId,
  createAnswer,
  updateAnswer,
  deleteAnswer,
  acceptAnswer,
  unacceptAnswer
} from '../controllers/answer.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Routes publiques
router.get('/', getAllAnswers);
router.get('/:id', getAnswerById);

// CORRECTION : Cette route était mal placée, la déplacer après les routes protégées
// ou changer l'ordre pour éviter les conflits
router.get('/question/:questionId', getAnswersByQuestionId);

// Routes protégées (nécessitent authentification)
router.post('/', authenticate, createAnswer);
router.put('/:id', authenticate, updateAnswer);
router.delete('/:id', authenticate, deleteAnswer);

// NOUVELLES ROUTES pour l'acceptation - BIEN PLACÉES
router.patch('/:id/accept', authenticate, acceptAnswer);
router.patch('/:id/unaccept', authenticate, unacceptAnswer);

export default router;