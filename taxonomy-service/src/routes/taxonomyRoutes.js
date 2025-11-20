import express from 'express';
import { getStats, deleteObservation, restoreObservation } from '../controllers/taxonomyController.js';
import { verifyToken, isAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Stats générales
router.get('/stats', verifyToken, getStats);

// Suppression logique d'une observation (ADMIN ou EXPERT)
router.patch('/observations/:id/delete', verifyToken, deleteObservation);

// Restauration d'une observation (ADMIN)
router.patch('/observations/:id/restore', verifyToken, isAdmin, restoreObservation);

export default router;
