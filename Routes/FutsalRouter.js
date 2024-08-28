const express = require('express');
const router = express.Router();
const { getFutsals, getFutsalById, createFutsal, updateFutsal, deleteFutsal } = require('../Controllers/FutsalController');
const validateFutsal = require('../Middlewares/FutsalValidation');
const authorizeRoles = require('../Middlewares/AuthRole');
const authenticateToken = require('../Middlewares/AuthToken');


router.get('/', getFutsals);
router.get('/:id', getFutsalById);


router.post('/create', authenticateToken, authorizeRoles(['owner']), validateFutsal, createFutsal);
router.put('/:id', authenticateToken, authorizeRoles(['owner']), validateFutsal, updateFutsal);
router.delete('/:id', authenticateToken, authorizeRoles(['owner']), deleteFutsal);

module.exports = router;
