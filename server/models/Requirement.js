import mongoose from 'mongoose';

const requirementSchema = new mongoose.Schema({
    tenderId: { type: String, required: true },
    category: { type: String, enum: ['PQ', 'TQ', 'COMMERCIAL'], required: true },
    key: { type: String, required: true },
    value: { type: String, required: true },
    sourceDocId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
    isSuperseded: { type: Boolean, default: false },
    lastUpdated: { type: Date, default: Date.now }
});

export default mongoose.model('Requirement', requirementSchema);
