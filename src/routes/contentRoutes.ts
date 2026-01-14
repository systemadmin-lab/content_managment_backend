import express from 'express';
import { createContent, deleteContent, getContentById, getContents, updateContent } from '../controllers/contentController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/', protect, getContents);
router.get('/:id', protect, getContentById);
router.post('/', protect, createContent);
router.put('/:id', protect, updateContent);
router.delete('/:id', protect, deleteContent);

export default router;
