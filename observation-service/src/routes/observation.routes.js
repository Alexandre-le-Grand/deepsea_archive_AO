const router = require('express').Router();
const obsController = require('../controllers/observation.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

// Routes Espèces
router.post('/species', verifyToken, obsController.createSpecies);
router.get('/species', obsController.getAllSpecies);

// Routes Observations
router.post('/observations', verifyToken, obsController.createObservation);
router.post('/observations/:id/validate', verifyToken, obsController.validateObservation);
router.post('/observations/:id/reject', verifyToken, obsController.rejectObservation);

module.exports = router;
