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
      evaluation = new Evaluation({ tenderId: req.params.tenderId });
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
