import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
    tenderId: { type: String, required: true },
    name: { type: String, required: true },
    type: { type: String, enum: ['RFP', 'RFQ', 'EOI', 'CORRIGENDUM'], required: true },
    version: { type: Number, default: 1 },
    filePath: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Document', documentSchema);
