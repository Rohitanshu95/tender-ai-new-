import mongoose from 'mongoose';
import Tender from './models/Tender.js';
import Evaluation from './models/Evaluation.js';
import Bidder from './models/Bidder.js';
import Activity from './models/Activity.js';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/procurement';

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    // Clear existing activities for a fresh seed
    await Activity.deleteMany({});
    console.log("Cleared existing activities");

    const activities = [];

    // 1. Seed from Tenders
    const tenders = await Tender.find().sort({ createdAt: -1 }).limit(10);
    tenders.forEach(t => {
      activities.push({
        type: 'TENDER_CREATE',
        tenderId: t.tenderId,
        message: `New tender created: ${t.tenderId}`,
        details: { title: t.title },
        timestamp: t.createdAt
      });
    });

    // 2. Seed from Evaluations
    const evaluations = await Evaluation.find().sort({ updatedAt: -1 }).limit(10);
    evaluations.forEach(e => {
      if (e.status === 'Completed') {
        activities.push({
          type: 'EVALUATION_COMPLETE',
          tenderId: e.tenderId,
          message: `Evaluation completed for ${e.tenderId}`,
          details: { finalStage: e.currentStage },
          timestamp: e.updatedAt
        });
      } else {
        activities.push({
          type: 'EVALUATION_START',
          tenderId: e.tenderId,
          message: `Evaluation started for ${e.tenderId}`,
          details: { stage: e.currentStage },
          timestamp: e.createdAt
        });
      }
    });

    // 3. Seed from Bidders
    const bidders = await Bidder.find().sort({ createdAt: -1 }).limit(10);
    bidders.forEach(b => {
      activities.push({
        type: 'UPLOAD',
        tenderId: b.tenderId,
        message: `New proposal uploaded by ${b.name}`,
        details: { bidderName: b.name },
        timestamp: b.createdAt
      });
    });

    await Activity.insertMany(activities);
    console.log(`Successfully seeded ${activities.length} activities`);
    
    await mongoose.disconnect();
  } catch (error) {
    console.error("Seeding failed:", error);
  }
}

seed();
