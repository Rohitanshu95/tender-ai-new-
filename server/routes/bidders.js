import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import Bidder from '../models/Bidder.js';
import BidderDocument from '../models/BidderDocument.js';
import Tender from '../models/Tender.js';

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = './uploads/proposals';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });
const router = express.Router();

// Get all tenders with their bidders and documents
router.get('/proposals', async (req, res) => {
    try {
        const tenders = await Tender.find().sort({ createdAt: -1 });
        const proposals = await Promise.all(tenders.map(async (tender) => {
            const bidders = await Bidder.find({ tenderId: tender.tenderId });
            const biddersWithDocs = await Promise.all(bidders.map(async (bidder) => {
                const documents = await BidderDocument.find({ 
                    tenderId: tender.tenderId,
                    bidderName: bidder.name 
                });
                return { ...bidder.toObject(), documents };
            }));
            
            // Also find bidders who might not be in the Bidder collection but have documents
            // (Since the user uses free-text for bidder name)
            const docBidders = await BidderDocument.distinct('bidderName', { tenderId: tender.tenderId });
            const existingBidderNames = bidders.map(b => b.name);
            
            for (const name of docBidders) {
                if (!existingBidderNames.includes(name)) {
                    const documents = await BidderDocument.find({ 
                        tenderId: tender.tenderId,
                        bidderName: name 
                    });
                    biddersWithDocs.push({
                        name,
                        tenderId: tender.tenderId,
                        documents,
                        isTemporary: true
                    });
                }
            }

            return { ...tender.toObject(), bidders: biddersWithDocs };
        }));
        res.json(proposals);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Upload proposal documents
router.post('/upload-proposal', upload.array('files', 10), async (req, res) => {
    try {
        const { tenderId, bidderName, proposalType } = req.body;
        const files = req.files;

        if (!files || files.length === 0) {
            return res.status(400).json({ message: 'No files uploaded' });
        }

        // Find or create the bidder record if needed (optional, since we use free-text)
        let bidder = await Bidder.findOne({ tenderId, name: bidderName });
        if (!bidder) {
            bidder = await Bidder.create({
                tenderId,
                name: bidderName,
                status: 'active',
                currentStage: 'PQ'
            });
        }

        const docPromises = files.map(file => {
            return BidderDocument.create({
                tenderId,
                bidderId: bidder._id,
                bidderName,
                name: file.originalname,
                type: proposalType || 'Uncategorized',
                filePath: file.path.replace(/\\/g, '/'),
                fileSize: file.size
            });
        });

        await Promise.all(docPromises);

        res.status(201).json({ message: 'Proposal documents uploaded successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get bidders for a specific tender
router.get('/tender/:tenderId', async (req, res) => {
    try {
        const { tenderId } = req.params;
        const bidders = await Bidder.find({ tenderId });
        
        const biddersWithDocs = await Promise.all(bidders.map(async (bidder) => {
            const documents = await BidderDocument.find({ 
                tenderId,
                bidderName: bidder.name 
            });
            return { ...bidder.toObject(), documents };
        }));

        res.json(biddersWithDocs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
