/**
 * Worker Process for Content Generation Queue
 * 
 * This is a separate Node.js process that monitors the Redis queue
 * and processes content generation jobs after the 1-minute delay.
 * 
 * Run with: npm run worker
 */

import { Job, Worker } from 'bullmq';
import dotenv from 'dotenv';
import Redis, { RedisOptions } from 'ioredis';
import mongoose from 'mongoose';
import path from 'path';
import { ContentGenerationJobData } from './config/queue';
import JobModel from './schemas/jobSchema';
import { generateContent } from './services/openRouterService';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Redis connection configuration for worker (Redis Cloud with authentication)
const redisConnectionConfig: RedisOptions = {
    host: process.env.REDIS_ENDPOINT || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    username: process.env.REDIS_USER || 'default',
    password: process.env.REDIS_PASSWORD,
    maxRetriesPerRequest: null
};

// Separate Redis connection for publishing events (Pub/Sub)
const redisPublisher = new Redis({
    host: process.env.REDIS_ENDPOINT || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    username: process.env.REDIS_USER || 'default',
    password: process.env.REDIS_PASSWORD,
    maxRetriesPerRequest: null
});

// Connect to MongoDB
const connectDB = async (): Promise<void> => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI as string);
        console.log(`[Worker] MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`[Worker] MongoDB connection error:`, error);
        process.exit(1);
    }
};

// Process job function
const processJob = async (job: Job<ContentGenerationJobData>): Promise<void> => {
    const { jobId, prompt, contentType, userId } = job.data;
    
    console.log(`[Worker] Processing job ${jobId}`);
    console.log(`[Worker] Content Type: ${contentType}`);
    console.log(`[Worker] Prompt: ${prompt.substring(0, 100)}...`);

    try {
        // Update job status to processing
        await JobModel.findOneAndUpdate(
            { jobId },
            { status: 'processing' }
        );

        // Call OpenRouter API
        console.log(`[Worker] Calling OpenRouter API...`);
        const generatedContent = await generateContent({ prompt, contentType });
        
        console.log(`[Worker] Content generated successfully (${generatedContent.length} chars)`);

        // Update job with generated content
        await JobModel.findOneAndUpdate(
            { jobId },
            { 
                status: 'completed',
                generatedContent,
                completedAt: new Date()
            }
        );

        // Publish completion event through Redis to the API server
        await redisPublisher.publish('job_completed', JSON.stringify({
            userId,
            jobId,
            status: 'completed',
            generatedContent,
            completedAt: new Date()
        }));

        console.log(`[Worker] Job ${jobId} completed successfully`);

    } catch (error) {
        console.error(`[Worker] Job ${jobId} failed:`, error);
        
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        // Update job with error
        await JobModel.findOneAndUpdate(
            { jobId },
            { 
                status: 'error',
                error: errorMessage
            }
        );

        // Re-throw to trigger BullMQ retry logic
        throw error;
    }
};

// Create and start worker
const startWorker = async (): Promise<void> => {
    // Connect to MongoDB first
    await connectDB();

    // Create worker
    const worker = new Worker<ContentGenerationJobData>(
        'content-generation',
        processJob,
        {
            connection: redisConnectionConfig,
            concurrency: 5, // Process up to 5 jobs concurrently
            limiter: {
                max: 10,
                duration: 60000 // Max 10 jobs per minute to respect API rate limits
            }
        }
    );

    // Worker event handlers
    worker.on('ready', () => {
        console.log('[Worker] Ready and waiting for jobs...');
    });

    worker.on('active', (job) => {
        console.log(`[Worker] Job ${job.id} is now active`);
    });

    worker.on('completed', (job) => {
        console.log(`[Worker] Job ${job.id} completed`);
    });

    worker.on('failed', (job, error) => {
        console.error(`[Worker] Job ${job?.id} failed:`, error.message);
    });

    worker.on('error', (error) => {
        console.error('[Worker] Worker error:', error);
    });

    // Graceful shutdown
    const shutdown = async (): Promise<void> => {
        console.log('[Worker] Shutting down...');
        await worker.close();
        await redisPublisher.quit();
        await mongoose.disconnect();
        console.log('[Worker] Shutdown complete');
        process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);

    console.log('[Worker] Content Generation Worker started');
    console.log('[Worker] Monitoring queue for jobs...');
};

// Start the worker
startWorker().catch((error) => {
    console.error('[Worker] Failed to start:', error);
    process.exit(1);
});
