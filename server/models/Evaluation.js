import mongoose from 'mongoose';

const EvaluationSchema = new mongoose.Schema({
  tenderId: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['Yet to Complete', 'In Progress', 'Completed'],
    default: 'Yet to Complete'
  },
  currentStage: {
    type: String,
    enum: ['PQ', 'TQ', 'Financial', 'Completed'],
    default: 'PQ'
  },
  pqResults: {
    bidders: [{
      bidderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bidder' },
      name: String,
      criteriaStatus: mongoose.Schema.Types.Mixed, // { registration: true, financial: false, ... }
      aiRecommendation: String,
      confidence: Number,
      decision: { type: String, enum: ['accept', 'reject', 'pending'], default: 'pending' },
      reason: String
    }],
    completedAt: Date,
    reportPath: String
  },
  tqResults: {
    criteria: [String], // Dynamic columns
    bidders: [{
      bidderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bidder' },
      name: String,
      scores: mongoose.Schema.Types.Mixed, // { "Technical Methodology": 85, ... }
      weightedScore: Number,
      rank: Number
    }],
    completedAt: Date,
    reportPath: String
  },
  financialResults: {
    method: { type: String, enum: ['L1', 'QCBS'], default: 'L1' },
    config: mongoose.Schema.Types.Mixed, // { techWeight: 70, finWeight: 30 }
    bidders: [{
      bidderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bidder' },
      name: String,
      quotedValue: Number,
      anomaly: String,
      score: Number // QCBS final score
    }],
    winnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bidder' },
    completedAt: Date
  }
}, { timestamps: true });

export default mongoose.model('Evaluation', EvaluationSchema);
