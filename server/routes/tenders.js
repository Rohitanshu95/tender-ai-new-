import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { 
    createTender, 
    getTenders, 
    getTenderById, 
    getTenderRequirements, 
    deleteTender,
    batchExtract,
    regenerate
} from '../controllers/tenderController.js';

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = './uploads';
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

router.post('/batch-extract', upload.fields([
    { name: 'rfp_files', maxCount: 5 },
    { name: 'corrigendum_files', maxCount: 15 }
]), batchExtract);

router.post('/:tenderId/regenerate', upload.fields([
    { name: 'corrigendum_files', maxCount: 15 }
]), regenerate);

router.post('/', createTender);
router.get('/', getTenders);
router.get('/:tenderId', getTenderById);
router.get('/:tenderId/requirements', getTenderRequirements);
router.delete('/:tenderId', deleteTender);

export default router;
