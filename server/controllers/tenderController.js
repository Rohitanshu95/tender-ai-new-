import Tender from '../models/Tender.js';
import Document from '../models/Document.js';
import Requirement from '../models/Requirement.js';
import axios from 'axios';

export const createTender = async (req, res) => {
    console.log("Creating/Updating Tender Payload:", req.body);
    try {
        const { 
            tenderId, title, organization, department, tenderType, 
            status, publishedDate, closingDate, requirements 
        } = req.body;

        // Ensure dates are valid or null
        const parseDate = (dateStr) => {
            if (!dateStr) return null;
            // Handle DD-MM-YYYY
            const ddmmyyyy = /^(\d{1,2})-(\d{1,2})-(\d{4})$/;
            const match = dateStr.match(ddmmyyyy);
            if (match) {
                return new Date(`${match[3]}-${match[2]}-${match[1]}`);
            }
            // Fallback to native
            const d = new Date(dateStr);
            return isNaN(d.getTime()) ? null : d;
        };

        const pDate = parseDate(publishedDate);
        const cDate = parseDate(closingDate);

        // 1. Save or Update the Tender
        const tender = await Tender.findOneAndUpdate(
            { tenderId },
            { 
                title: title || "Untitled Tender", 
                organization: organization || "Unknown Authority", 
                department: department || "General", 
                tenderType: (tenderType || "RFP").toUpperCase(), 
                status: status || "In Evaluation", 
                publishedDate: pDate, 
                closingDate: cDate,
                hasTemplate: requirements && requirements.length > 0,
                updatedAt: Date.now()
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        // 2. If requirements are provided, save them
        if (requirements && requirements.length > 0) {
            // Remove old requirements for this tender to avoid duplicates
            await Requirement.deleteMany({ tenderId });
            
            const requirementDocs = requirements.map(r => ({
                tenderId,
                category: r.category,
                key: r.key,
                value: r.value,
                sourceDocId: r.sourceDocId || 'initial-extraction'
            }));
            
            await Requirement.insertMany(requirementDocs);
        }

        res.status(201).json({ 
            message: 'Tender and requirements saved successfully',
            tender 
        });
    } catch (error) {
        console.error("Create tender error:", error);
        res.status(500).json({ message: error.message });
    }
};

export const getTenders = async (req, res) => {
    try {
        const tenders = await Tender.find().sort({ createdAt: -1 });
        res.json(tenders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getTenderById = async (req, res) => {
    try {
        const tender = await Tender.findOne({ tenderId: req.params.tenderId });
        if (!tender) return res.status(404).json({ message: 'Tender not found' });
        res.json(tender);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteTender = async (req, res) => {
    try {
        const { tenderId } = req.params;
        await Tender.findOneAndDelete({ tenderId });
        await Requirement.deleteMany({ tenderId });
        res.json({ message: 'Tender deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getTenderRequirements = async (req, res) => {
    try {
        const requirements = await Requirement.find({ tenderId: req.params.tenderId });
        res.json(requirements);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const batchExtract = async (req, res) => {
    try {
        const { doc_type, tender_id } = req.body;
        const rfpFiles = req.files['rfp_files'] || [];
        const corrigendumFiles = req.files['corrigendum_files'] || [];

        if (rfpFiles.length === 0) {
            return res.status(400).json({ message: 'Main document is required' });
        }

        const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
        const AI_API_BASE = AI_SERVICE_URL.endsWith('/api/v1') ? AI_SERVICE_URL : `${AI_SERVICE_URL}/api/v1`;

        const agents = ['general', 'pq', 'tq'];
        const extractionPromises = agents.map(async (agent) => {
            const formData = new FormData();
            
            // Re-append files to the FormData for each agent call
            const { Blob, File } = await import('buffer');
            
            rfpFiles.forEach(f => {
                const file = new File([f.buffer], f.originalname, { type: f.mimetype });
                formData.append('rfp_files', file);
            });
            corrigendumFiles.forEach(f => {
                const file = new File([f.buffer], f.originalname, { type: f.mimetype });
                formData.append('corrigendum_files', file);
            });
            
            formData.append('doc_type', doc_type);
            formData.append('template_type', agent);

            const url = agent === 'general' ? `${AI_API_BASE}/extract/` : `${AI_API_BASE}/extract/generate-template`;
            
            console.log(`[BatchExtract] Calling ${agent} agent at ${url}...`);
            
            try {
                // Using axios for internal call as it handles FormData boundaries more reliably in Node
                const response = await axios.post(url, formData);
                console.log(`[BatchExtract] ${agent} agent success.`);
                return { agent, data: response.data };
            } catch (err) {
                console.error(`[BatchExtract] ${agent} agent failed:`, err.response?.data || err.message);
                throw new Error(`${agent} agent failed: ${err.response?.data?.detail || err.message}`);
            }
        });

        const results = await Promise.all(extractionPromises);
        
        const output = {
            general: results.find(r => r.agent === 'general').data.data,
            pq: results.find(r => r.agent === 'pq').data.requirements,
            tq: results.find(r => r.agent === 'tq').data.requirements
        };

        res.json(output);
    } catch (error) {
        console.error("Batch extraction overall error:", error.message);
        res.status(500).json({ message: error.message });
    }
};
