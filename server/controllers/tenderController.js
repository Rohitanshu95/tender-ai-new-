import Tender from '../models/Tender.js';
import Document from '../models/Document.js';
import Requirement from '../models/Requirement.js';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { Blob, File } from 'buffer';

export const createTender = async (req, res) => {
    console.log("Creating/Updating Tender Payload:", req.body);
    try {
        const { 
            tenderId, title, organization, department, tenderType, estimatedValue,
            status, publishedDate, closingDate, requirements 
        } = req.body;

        // Ensure dates are valid or null
        const parseDate = (dateStr) => {
            if (!dateStr) return null;
            // Handle DD-MM-YYYY or DD/MM/YYYY
            const ddmmyyyy = /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/;
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
                estimatedValue: estimatedValue || "N/A",
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
        console.error("CRITICAL: Create tender failure!");
        console.error("Error Name:", error.name);
        console.error("Error Message:", error.message);
        if (error.errors) {
            console.error("Validation Errors:", Object.keys(error.errors).map(k => `${k}: ${error.errors[k].message}`));
        }
        res.status(500).json({ 
            message: error.message,
            details: error.errors ? Object.keys(error.errors) : null
        });
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
        const { doc_type } = req.body;
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
            
            for (const f of rfpFiles) {
                const buffer = fs.readFileSync(f.path);
                const file = new File([buffer], f.originalname, { type: f.mimetype });
                formData.append('rfp_files', file);
            }
            for (const f of corrigendumFiles) {
                const buffer = fs.readFileSync(f.path);
                const file = new File([buffer], f.originalname, { type: f.mimetype });
                formData.append('corrigendum_files', file);
            }
            
            formData.append('doc_type', doc_type);
            formData.append('template_type', agent);

            const url = agent === 'general' ? `${AI_API_BASE}/extract/` : `${AI_API_BASE}/extract/generate-template`;
            
            try {
                const response = await axios.post(url, formData);
                return { agent, data: response.data };
            } catch (err) {
                console.error(`[BatchExtract] ${agent} agent failed:`, err.response?.data || err.message);
                throw new Error(`${agent} agent failed: ${err.response?.data?.detail || err.message}`);
            }
        });

        const results = await Promise.all(extractionPromises);
        const generalData = results.find(r => r.agent === 'general').data.data;
        const tenderId = generalData.tender_id || `TND-${Date.now()}`;

        // Save documents to DB
        const docPromises = [];
        rfpFiles.forEach(f => {
            docPromises.push(Document.create({
                tenderId,
                name: f.originalname,
                type: doc_type.toUpperCase(),
                filePath: f.path.replace(/\\/g, '/')
            }));
        });
        corrigendumFiles.forEach(f => {
            docPromises.push(Document.create({
                tenderId,
                name: f.originalname,
                type: 'CORRIGENDUM',
                filePath: f.path.replace(/\\/g, '/')
            }));
        });
        await Promise.all(docPromises);
        
        const output = {
            general: {
                ...generalData,
                estimated_value: generalData.estimated_value || "N/A"
            },
            pq: results.find(r => r.agent === 'pq').data.requirements,
            tq: results.find(r => r.agent === 'tq').data.requirements
        };

        res.json(output);
    } catch (error) {
        console.error("Batch extraction overall error:", error.message);
        res.status(500).json({ message: error.message });
    }
};

export const regenerate = async (req, res) => {
    try {
        const { tenderId } = req.params;
        const newCorrigenda = req.files['corrigendum_files'] || [];
        
        // 1. Fetch existing tender and documents
        const tender = await Tender.findOne({ tenderId });
        if (!tender) return res.status(404).json({ message: 'Tender not found' });

        const existingDocs = await Document.find({ tenderId });
        const rfpDoc = existingDocs.find(d => ['RFP', 'RFQ', 'EOI'].includes(d.type));
        const oldCorrigenda = existingDocs.filter(d => d.type === 'CORRIGENDUM');

        if (!rfpDoc) return res.status(400).json({ message: 'Original RFP document missing' });

        // 2. Save new corrigenda to DB first
        const newDocPromises = newCorrigenda.map(f => Document.create({
            tenderId,
            name: f.originalname,
            type: 'CORRIGENDUM',
            filePath: f.path.replace(/\\/g, '/')
        }));
        const savedNewDocs = await Promise.all(newDocPromises);
        
        // 3. Prepare ALL files for AI service (Original RFP + Old Corrigenda + New Corrigenda)
        const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
        const AI_API_BASE = `${AI_SERVICE_URL}/api/v1`;

        const agents = ['general', 'pq', 'tq'];
        const extractionPromises = agents.map(async (agent) => {
            const formData = new FormData();
            
            // Original RFP
            const rfpBuffer = fs.readFileSync(rfpDoc.filePath);
            formData.append('rfp_files', new File([rfpBuffer], rfpDoc.name, { type: 'application/pdf' }));

            // ALL Corrigenda (Old + New)
            for (const doc of [...oldCorrigenda, ...savedNewDocs]) {
                const buffer = fs.readFileSync(doc.filePath);
                formData.append('corrigendum_files', new File([buffer], doc.name, { type: 'application/pdf' }));
            }
            
            formData.append('doc_type', tender.tenderType.toLowerCase());
            formData.append('template_type', agent);

            const url = agent === 'general' ? `${AI_API_BASE}/extract/` : `${AI_API_BASE}/extract/generate-template`;
            const response = await axios.post(url, formData);
            return { agent, data: response.data };
        });

        const results = await Promise.all(extractionPromises);
        const generalData = results.find(r => r.agent === 'general').data.data;

        // 4. Update Requirements in DB
        const pq = results.find(r => r.agent === 'pq').data.requirements;
        const tq = results.find(r => r.agent === 'tq').data.requirements;

        await Requirement.deleteMany({ tenderId });
        const requirementDocs = [
            ...pq.map(r => ({ tenderId, category: 'PQ', key: r.key, value: r.value })),
            ...tq.map(r => ({ tenderId, category: 'TQ', key: r.key, value: r.value }))
        ];
        await Requirement.insertMany(requirementDocs);

        // Update tender template status
        tender.hasTemplate = true;
        await tender.save();

        res.json({ 
            general: generalData,
            pq, 
            tq 
        });
    } catch (error) {
        console.error("Regeneration error:", error.message);
        res.status(500).json({ message: error.message });
    }
};
