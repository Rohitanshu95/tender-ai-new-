import express from 'express';
import multer from 'multer';
import { 
    createTender, 
    getTenders, 
    getTenderById, 
    getTenderRequirements, 
    deleteTender,
    batchExtract 
} from '../controllers/tenderController.js';

const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

router.post('/batch-extract', upload.fields([
    { name: 'rfp_files', maxCount: 5 },
    { name: 'corrigendum_files', maxCount: 10 }
]), batchExtract);

router.post('/', createTender);
router.get('/', getTenders);
router.get('/:tenderId', getTenderById);
router.get('/:tenderId/requirements', getTenderRequirements);
router.delete('/:tenderId', deleteTender);

export default router;
