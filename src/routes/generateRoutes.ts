import express from 'express';
import {
    getJobStatus,
    getUserJobs,
    queueContentGeneration,
    saveGeneratedContent
} from '../controllers/generateController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Queue a new content generation job (1-minute delay)
router.post('/', protect, queueContentGeneration);

// Get all jobs for the authenticated user
router.get('/', protect, getUserJobs);

// Get status of a specific job
router.get('/:jobId', protect, getJobStatus);

// Save generated content from a completed job
router.post('/:jobId/save', protect, saveGeneratedContent);

export default router;
