import mongoose from 'mongoose';

const ActivitySchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['UPLOAD', 'AI_EXTRACTION', 'EVALUATION_START', 'EVALUATION_COMPLETE', 'TENDER_CREATE'],
    required: true
  },
  tenderId: String,
  message: String,
  details: mongoose.Schema.Types.Mixed,
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('Activity', ActivitySchema);
