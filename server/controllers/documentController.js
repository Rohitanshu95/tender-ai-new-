import Document from '../models/Document.js';
import Requirement from '../models/Requirement.js';
import fs from 'fs';
import path from 'path';

export const deleteDocument = async (req, res) => {
    try {
        const document = await Document.findById(req.params.id);
        if (!document) return res.status(404).json({ message: 'Document not found' });

        // Delete from file system if needed (assuming path is absolute or relative to server root)
        // const filePath = path.resolve(document.filePath);
        // if (fs.existsSync(filePath)) {
        //     fs.unlinkSync(filePath);
        // }

        // Remove associated requirements
        await Requirement.deleteMany({ sourceDocId: document._id });

        // Delete from DB
        await Document.findByIdAndDelete(req.params.id);

        res.status(200).json({ message: 'Document and associated requirements deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getDocuments = async (req, res) => {
    try {
        const { tenderId } = req.query;
        const query = tenderId ? { tenderId } : {};
        const documents = await Document.find(query);
        res.status(200).json(documents);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
