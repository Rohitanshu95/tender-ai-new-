import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';

// Routes
import tenderRoutes from './routes/tenders.js';
import documentRoutes from './routes/documents.js';
import evaluationRoutes from './routes/evaluations.js';
import bidderRoutes from './routes/bidders.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Request Logger
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Routes
app.use('/api/tenders', tenderRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/evaluations', evaluationRoutes);
app.use('/api/bidders', bidderRoutes);

app.post('/test-direct', (req, res) => res.json({ message: 'Direct hits work!' }));

app.get('/', (req, res) => {
    res.send('Procurement Server is running...');
});

// Catch-all 404 logger
app.use((req, res) => {
    console.warn(`[404 NOT FOUND] ${req.method} ${req.url}`);
    res.status(404).json({ message: `Route ${req.url} not found on this server.` });
});

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err);
    });
