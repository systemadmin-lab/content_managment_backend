import mongoose, { Document, Schema } from 'mongoose';

export interface IContent extends Document {
    userId: mongoose.Types.ObjectId;
    title: string;
    type: 'Blog Post Outline' | 'Product Description' | 'Social Media Caption';
    body: string;
}

const contentSchema: Schema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    title: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ['Blog Post Outline', 'Product Description', 'Social Media Caption']
    },
    body: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

export default mongoose.model<IContent>('Content', contentSchema);
