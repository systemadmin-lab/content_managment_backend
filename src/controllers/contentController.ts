import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Content from '../schemas/contentSchema';

// @desc    Get all contents with optional search
// @route   GET /content
// @access  Private
export const getContents = async (req: Request, res: Response) => {
    try {
        const keyword = req.query.search
            ? {
                $or: [
                    { title: { $regex: req.query.search as string, $options: 'i' } },
                    { type: { $regex: req.query.search as string, $options: 'i' } },
                    { body: { $regex: req.query.search as string, $options: 'i' } }
                ],
            }
            : {};
        
        if (!req.user) {
            return res.status(401).json({ message: 'User not found' });
        }

        // Ensure user only sees their own content
        const contents = await Content.find({ ...keyword, userId: req.user._id as mongoose.Types.ObjectId }).sort({ createdAt: -1 });
        res.status(200).json(contents);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Create new content
// @route   POST /content
// @access  Private
export const createContent = async (req: Request, res: Response) => {
    try {
        const { title, type, body } = req.body;

        if (!title || !type || !body) {
            return res.status(400).json({ message: 'Please provide all fields' });
        }

        const validTypes = ['Blog Post Outline', 'Product Description', 'Social Media Caption'];
        if (!validTypes.includes(type)) {
             return res.status(400).json({ message: 'Invalid content type' });
        }

        if (!req.user) {
            return res.status(401).json({ message: 'User not found' });
        }

        const content = await Content.create({
            userId: req.user._id as mongoose.Types.ObjectId,
            title,
            type,
            body
        });

        res.status(201).json(content);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update content
// @route   PUT /content/:id
// @access  Private
export const updateContent = async (req: Request, res: Response) => {
    try {
        const content = await Content.findById(req.params.id);

        if (!content) {
            return res.status(404).json({ message: 'Content not found' });
        }

        // Check for user
        if (!req.user) {
            return res.status(401).json({ message: 'User not found' });
        }

        // Make sure the logged in user matches the content user
        if (content.userId.toString() !== (req.user._id as mongoose.Types.ObjectId).toString()) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        const updatedContent = await Content.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.status(200).json(updatedContent);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Delete content
// @route   DELETE /content/:id
// @access  Private
export const deleteContent = async (req: Request, res: Response) => {
    try {
        const content = await Content.findById(req.params.id);

        if (!content) {
            return res.status(404).json({ message: 'Content not found' });
        }

        // Check for user
        if (!req.user) {
            return res.status(401).json({ message: 'User not found' });
        }

        // Make sure the logged in user matches the content user
        if (content.userId.toString() !== (req.user._id as mongoose.Types.ObjectId).toString()) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        await content.deleteOne();

        res.status(200).json({ id: req.params.id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
