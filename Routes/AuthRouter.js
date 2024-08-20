
const { ownerLogin, ownerSignup } = require('../Controllers/OwnerController');
const { playerLogin, playerSignup } = require('../Controllers/PlayerController');
const { playerLoginValidation, playerSignupValidation, ownerLoginValidation, ownerSignupValidation } = require('../Middlewares/AuthValidation');
const router = require('express').Router();

router.post('/player/login', playerLoginValidation, playerLogin);
router.post('/player/signup', playerSignupValidation, playerSignup);

router.post('/owner/login', ownerLoginValidation, ownerLogin);
router.post('/owner/signup', ownerSignupValidation, ownerSignup);

module.exports = router;

