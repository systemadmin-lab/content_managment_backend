import { Queue } from 'bullmq';
import { RedisOptions } from 'ioredis';

// Function to get Redis connection config (called after env vars are loaded)
export function getRedisConnectionConfig(): RedisOptions {
    return {
        host: process.env.REDIS_ENDPOINT || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        username: process.env.REDIS_USER || 'default',
        password: process.env.REDIS_PASSWORD,
        maxRetriesPerRequest: null // Required for BullMQ
    };
}

// Lazy-initialized queue instance
let _contentGenerationQueue: Queue | null = null;

// content generation queue will be created on first call
export function getContentGenerationQueue(): Queue {
    if (!_contentGenerationQueue) {
        _contentGenerationQueue = new Queue('content-generation', {
            connection: getRedisConnectionConfig(),
            defaultJobOptions: {
                attempts: 3, 
                backoff: {
                    type: 'exponential',
                    delay: 1000
                },
                removeOnComplete: false, 
                removeOnFail: false
            }
        });
    }
    return _contentGenerationQueue;
}

// Job data interface
export interface ContentGenerationJobData {
    userId: string;
    prompt: string;
    contentType: 'Blog Post Outline' | 'Product Description' | 'Social Media Caption';
    jobId: string;
}

// job delay time (5 seconds for testing - change to 60000 for production)
export const JOB_DELAY_MS = 5000;
