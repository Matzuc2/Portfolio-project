import express from 'express';
import { 
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserQuestions 
} from '../controllers/user.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Routes publiques
router.get('/', getAllUsers);
router.get('/:id', getUserById);

// Routes protégées (nécessitent authentification)
router.put('/:id', authenticate, updateUser);
router.delete('/:id', authenticate, deleteUser);
router.get('/:id/questions', getUserQuestions);

export default router;