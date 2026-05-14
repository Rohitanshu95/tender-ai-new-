import mongoose from 'mongoose';

const evaluationSchema = new mongoose.Schema({
    bidderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bidder', required: true },
    tenderId: { type: String, required: true },
    stage: { type: String, enum: ['PQ', 'TQ', 'FINANCIAL'], required: true },
    scores: { type: Map, of: Number }, // For TQ criteria marks
    totalScore: { type: Number },
    evaluatorName: { type: String },
    aiRecommendation: { type: String }, // AI suggestion (Qualified/Not Qualified)
    decision: { type: String, enum: ['accept', 'reject', 'pending'], default: 'pending' },
    remarks: { type: String },
    updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Evaluation', evaluationSchema);
