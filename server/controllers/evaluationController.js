import Bidder from '../models/Bidder.js';
import Evaluation from '../models/Evaluation.js';

export const getBiddersByTender = async (req, res) => {
    try {
        const { tenderId } = req.params;
        const bidders = await Bidder.find({ tenderId });
        res.status(200).json(bidders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createBidder = async (req, res) => {
    try {
        const bidder = new Bidder(req.body);
        await bidder.save();
        res.status(201).json(bidder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateEvaluation = async (req, res) => {
    try {
        const { bidderId, stage } = req.body;
        let evaluation = await Evaluation.findOne({ bidderId, stage });
        
        if (evaluation) {
            Object.assign(evaluation, req.body);
        } else {
            evaluation = new Evaluation(req.body);
        }
        
        await evaluation.save();

        // If PQ is accepted, update bidder status
        if (stage === 'PQ' && req.body.decision === 'accept') {
            await Bidder.findByIdAndUpdate(bidderId, { currentStage: 'TQ' });
        }

        res.status(200).json(evaluation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getEvaluationsByTender = async (req, res) => {
    try {
        const { tenderId, stage } = req.query;
        const evaluations = await Evaluation.find({ tenderId, stage }).populate('bidderId');
        res.status(200).json(evaluations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
