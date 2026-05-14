import mongoose from 'mongoose';

const requirementSchema = new mongoose.Schema({
    tenderId: { type: String, required: true },
    category: { type: String, required: true },
    key: { type: String, required: true },
    value: { type: String },
    sourceDocId: { type: String },
    isSuperseded: { type: Boolean, default: false },
    lastUpdated: { type: Date, default: Date.now }
});

export default mongoose.model('Requirement', requirementSchema);
