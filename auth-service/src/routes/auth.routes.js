const router = require('express').Router();
const authController = require('../controllers/auth.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');

router.post('/register', authController.register); 
router.post('/login', authController.login);
router.get('/me', verifyToken, authController.getMe);

router.get('/admin/users', verifyToken, isAdmin, authController.getAllUsers);
router.patch('/users/:id/role', verifyToken, isAdmin, authController.updateRole);

router.patch('/internal/reputation', authController.updateReputation);

module.exports = router;
