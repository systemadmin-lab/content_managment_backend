import mongoose, { Document, Schema } from 'mongoose';

export interface IJob extends Document {
    jobId: string;
    userId: mongoose.Types.ObjectId;
    prompt: string;
    contentType: 'Blog Post Outline' | 'Product Description' | 'Social Media Caption';
    status: 'queued' | 'processing' | 'completed' | 'failed' | 'error';
    generatedContent?: string;
    error?: string;
    scheduledFor: Date;
    completedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const jobSchema: Schema = new mongoose.Schema({
    jobId: {
        type: String,
        required: true,
        unique: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    prompt: {
        type: String,
        required: true
    },
    contentType: {
        type: String,
        required: true,
        enum: ['Blog Post Outline', 'Product Description', 'Social Media Caption']
    },
    status: {
        type: String,
        required: true,
        enum: ['queued', 'processing', 'completed', 'failed', 'error'],
        default: 'queued'
    },
    generatedContent: {
        type: String
    },
    error: {
        type: String
    },
    scheduledFor: {
        type: Date,
        required: true
    },
    completedAt: {
        type: Date
    }
}, {
    timestamps: true
});

export default mongoose.model<IJob>('Job', jobSchema);
