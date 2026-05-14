import mongoose from 'mongoose';

const bidderSchema = new mongoose.Schema({
    tenderId: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String },
    contact: { type: String },
    currentStage: { type: String, enum: ['PQ', 'TQ', 'FINANCIAL', 'AWARDED'], default: 'PQ' },
    status: { type: String, enum: ['active', 'qualified', 'disqualified'], default: 'active' }
});

export default mongoose.model('Bidder', bidderSchema);
