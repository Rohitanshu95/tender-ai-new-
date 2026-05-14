import mongoose from 'mongoose';

const bidderDocumentSchema = new mongoose.Schema({
    tenderId: { type: String, required: true },
    bidderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bidder' },
    bidderName: { type: String, required: true },
    name: { type: String, required: true }, // Original filename
    type: { type: String }, // e.g., 'PQ', 'Technical', 'Financial'
    filePath: { type: String, required: true },
    fileSize: { type: Number },
    uploadedAt: { type: Date, default: Date.now }
});

export default mongoose.model('BidderDocument', bidderDocumentSchema);
