import express from 'express';
import tenderRoutes from './routes/tenders.js';

const app = express();
app.use('/api/tenders', tenderRoutes);

console.log('--- Tender Routes ---');
tenderRoutes.stack.forEach(layer => {
    if (layer.route) {
        console.log(`${Object.keys(layer.route.methods).join(',').toUpperCase()} ${layer.route.path}`);
    }
});
