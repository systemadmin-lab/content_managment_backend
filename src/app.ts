import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import connectDB from './config/db';
import contentRoutes from './routes/contentRoutes';
import userRoutes from './routes/userRoutes';

dotenv.config({ path: path.join(__dirname, '../.env') });

connectDB();

const app = express();
app.use(express.json());
app.use("/auth", userRoutes);
app.use("/content", contentRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
