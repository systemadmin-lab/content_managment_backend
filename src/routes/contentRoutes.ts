import express from 'express';
import { createContent, deleteContent, getContents, updateContent } from '../controllers/contentController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/', protect, getContents);
router.post('/', protect, createContent);
router.put('/:id', protect, updateContent);
router.delete('/:id', protect, deleteContent);

export default router;
