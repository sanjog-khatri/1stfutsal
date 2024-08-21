const express = require('express');
const router = express.Router();
const { getFutsals, getFutsalById, createFutsal, updateFutsal, deleteFutsal } = require('../Controllers/FutsalController');
const validateFutsal = require('../Middlewares/FutsalValidation');

router.get('/', getFutsals);
router.get('/:id',getFutsalById);
router.post('/', validateFutsal, createFutsal);
router.put('/:id', validateFutsal, updateFutsal);
router.delete('/:id',deleteFutsal);

module.exports = router;
