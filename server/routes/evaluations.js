import express from 'express';
import { getBiddersByTender, createBidder, updateEvaluation, getEvaluationsByTender } from '../controllers/evaluationController.js';

const router = express.Router();

router.get('/bidders/:tenderId', getBiddersByTender);
router.post('/bidders', createBidder);
router.post('/evaluate', updateEvaluation);
router.get('/evaluations', getEvaluationsByTender);

export default router;
