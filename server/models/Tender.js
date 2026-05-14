import mongoose from 'mongoose';

const tenderSchema = new mongoose.Schema({
    tenderId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    estimatedValue: { type: String },
    description: { type: String },
    organization: { type: String },
    department: { type: String },
    tenderType: { type: String },
    publishedDate: { type: Date },
    closingDate: { type: Date },
    status: { type: String, default: 'In Evaluation' },
    hasTemplate: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Tender', tenderSchema);
