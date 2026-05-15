import express from 'express';
const router = express.Router();
import Evaluation from '../models/Evaluation.js';
import Tender from '../models/Tender.js';
import Bidder from '../models/Bidder.js';

// Get status of all evaluations
router.get('/status', async (req, res) => {
  try {
    const tenders = await Tender.find().select('tenderId title organization department');
    const evaluations = await Evaluation.find();
    
    const statusData = tenders.map(tender => {
      const evaluation = evaluations.find(e => e.tenderId === tender.tenderId);
      return {
        ...tender.toObject(),
        status: evaluation ? evaluation.status : 'Yet to Complete',
        currentStage: evaluation ? evaluation.currentStage : 'PQ',
        evaluationId: evaluation ? evaluation._id : null
      };
    });
    
    res.json(statusData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Initialize or Get Evaluation for a tender
router.get('/:tenderId', async (req, res) => {
  try {
    let evaluation = await Evaluation.findOne({ tenderId: req.params.tenderId });
    if (!evaluation) {
      evaluation = new Evaluation({ tenderId: req.params.tenderId, pqResults: { bidders: [] } });
    }

    // Sync bidders from Bidder collection
    const allBidders = await Bidder.find({ tenderId: req.params.tenderId });
    const BidderDocument = (await import('../models/BidderDocument.js')).default;
    
    const existingBidders = evaluation.pqResults.bidders || [];
    const existingBidderIds = existingBidders.map(b => b.bidderId?.toString());

    let hasChanges = false;
    
    // Process all bidders to ensure they exist in evaluation and have latest docs
    const updatedBidders = await Promise.all(allBidders.map(async (bidder) => {
      const documents = await BidderDocument.find({ 
        tenderId: req.params.tenderId,
        bidderName: bidder.name 
      });

      const existingIndex = existingBidderIds.indexOf(bidder._id.toString());
      
      if (existingIndex === -1) {
        hasChanges = true;
        return {
          bidderId: bidder._id,
          name: bidder.name,
          decision: 'pending',
          criteriaStatus: { registration: false, financial: false, experience: false, compliance: false },
          documents: documents
        };
      } else {
        // Update documents for existing bidders too
        const existing = existingBidders[existingIndex];
        // Only mark as changed if doc count changed (simple check)
        if ((existing.documents?.length || 0) !== documents.length) {
          hasChanges = true;
          return { ...existing.toObject(), documents };
        }
        return existing;
      }
    }));

    if (hasChanges || evaluation.isNew) {
      evaluation.pqResults.bidders = updatedBidders;
      await evaluation.save();
    }

    res.json(evaluation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update evaluation stage/results
router.post('/update', async (req, res) => {
  const { tenderId, stage, results, status, currentStage } = req.body;
  try {
    const update = {};
    if (stage === 'PQ') update.pqResults = results;
    if (stage === 'TQ') update.tqResults = results;
    if (stage === 'Financial') update.financialResults = results;
    if (status) update.status = status;
    if (currentStage) update.currentStage = currentStage;

    const evaluation = await Evaluation.findOneAndUpdate(
      { tenderId },
      { $set: update },
      { new: true, upsert: true }
    );
    res.json(evaluation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
