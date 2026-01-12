import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { ContentGenerationJobData, getContentGenerationQueue, JOB_DELAY_MS } from '../config/queue';
import Job from '../schemas/jobSchema';

// @desc    Queue content generation job
// @route   POST /generate-content
// @access  Private
export const queueContentGeneration = async (req: Request, res: Response) => {
    try {
        const { prompt, contentType } = req.body;

        // Validate input
        if (!prompt || !contentType) {
            return res.status(400).json({ 
                message: 'Please provide prompt and contentType' 
            });
        }

        const validTypes = ['Blog Post Outline', 'Product Description', 'Social Media Caption'];
        if (!validTypes.includes(contentType)) {
            return res.status(400).json({ 
                message: 'Invalid content type. Must be one of: Blog Post Outline, Product Description, Social Media Caption' 
            });
        }

        if (!req.user) {
            return res.status(401).json({ message: 'User not found' });
        }

        // Generate unique job ID
        const jobId = uuidv4();
        const scheduledFor = new Date(Date.now() + JOB_DELAY_MS);

        // Create job record in MongoDB
        const jobRecord = await Job.create({
            jobId,
            userId: req.user._id as mongoose.Types.ObjectId,
            prompt,
            contentType,
            status: 'queued',
            scheduledFor
        });

        // Prepare job data for queue
        const jobData: ContentGenerationJobData = {
            userId: (req.user._id as mongoose.Types.ObjectId).toString(),
            prompt,
            contentType,
            jobId
        };

        // Add job to queue with 1-minute delay
        await getContentGenerationQueue().add('generate', jobData, {
            delay: JOB_DELAY_MS, // 60000ms = 1 minute
            jobId // Use our jobId as BullMQ's job ID for easy tracking
        });

        // Return 202 Accepted with job details
        res.status(202).json({
            message: 'Content generation job queued successfully',
            jobId,
            status: 'queued',
            delaySeconds: JOB_DELAY_MS / 1000,
            scheduledFor: scheduledFor.toISOString(),
            estimatedCompletionTime: new Date(scheduledFor.getTime() + 30000).toISOString() // Add ~30s for processing
        });

    } catch (error) {
        console.error('Error queuing content generation:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get job status
// @route   GET /generate-content/:jobId
// @access  Private
export const getJobStatus = async (req: Request, res: Response) => {
    try {
        const { jobId } = req.params;

        if (!req.user) {
            return res.status(401).json({ message: 'User not found' });
        }

        const job = await Job.findOne({ 
            jobId, 
            userId: req.user._id as mongoose.Types.ObjectId 
        });

        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        const response: any = {
            jobId: job.jobId,
            status: job.status,
            contentType: job.contentType,
            prompt: job.prompt,
            scheduledFor: job.scheduledFor,
            createdAt: job.createdAt
        };

        // Include generated content if completed
        if (job.status === 'completed' && job.generatedContent) {
            response.generatedContent = job.generatedContent;
            response.completedAt = job.completedAt;
        }

        // Include error if failed
        if ((job.status === 'error' || job.status === 'failed') && job.error) {
            response.error = job.error;
        }

        res.status(200).json(response);

    } catch (error) {
        console.error('Error getting job status:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get all jobs for user
// @route   GET /generate-content
// @access  Private
export const getUserJobs = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'User not found' });
        }

        const jobs = await Job.find({ 
            userId: req.user._id as mongoose.Types.ObjectId 
        }).sort({ createdAt: -1 });

        res.status(200).json(jobs);

    } catch (error) {
        console.error('Error getting user jobs:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Save generated content to Content collection
// @route   POST /generate-content/:jobId/save
// @access  Private
export const saveGeneratedContent = async (req: Request, res: Response) => {
    try {
        const { jobId } = req.params;
        const { title } = req.body;

        if (!req.user) {
            return res.status(401).json({ message: 'User not found' });
        }

        const job = await Job.findOne({ 
            jobId, 
            userId: req.user._id as mongoose.Types.ObjectId 
        });

        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        if (job.status !== 'completed') {
            return res.status(400).json({ 
                message: 'Cannot save content from incomplete job',
                currentStatus: job.status
            });
        }

        if (!job.generatedContent) {
            return res.status(400).json({ message: 'No generated content available' });
        }

        // Import Content model dynamically to avoid circular dependencies
        const Content = (await import('../schemas/contentSchema')).default;

        // Create content entry
        const content = await Content.create({
            userId: req.user._id as mongoose.Types.ObjectId,
            title: title || `Generated: ${job.prompt.substring(0, 50)}...`,
            type: job.contentType,
            body: job.generatedContent
        });

        res.status(201).json({
            message: 'Content saved successfully',
            content
        });

    } catch (error) {
        console.error('Error saving generated content:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
