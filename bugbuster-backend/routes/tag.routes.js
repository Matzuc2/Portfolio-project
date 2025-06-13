import express from 'express';
import { getAllTags, getTagById, createTag, updateTag, deleteTag, getQuestionsByTag } from '../controllers/tag.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Routes publiques
router.get('/', getAllTags);
router.get('/:id', getTagById);
router.get('/:tagId/questions', getQuestionsByTag);

// Routes protégées (nécessitent authentification)
router.post('/', authenticate, createTag);
router.put('/:id', authenticate, updateTag);
router.delete('/:id', authenticate, deleteTag);

export default router;