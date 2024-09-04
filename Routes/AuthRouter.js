
const { ownerLogin, ownerSignup, updateOwner, deleteOwner,  } = require('../Controllers/OwnerController');
const { playerLogin, playerSignup, updatePlayer, deletePlayer,  } = require('../Controllers/PlayerController');
const { playerLoginValidation, playerSignupValidation, ownerLoginValidation, ownerSignupValidation } = require('../Middlewares/AuthValidation');
const authenticateToken = require('../Middlewares/AuthToken');
const authorizeRoles = require('../Middlewares/AuthRole');

const router = require('express').Router();

router.post('/player/login', playerLoginValidation, playerLogin);
router.post('/player/signup', playerSignupValidation, playerSignup);
router.put('/player/:_id', authenticateToken, authorizeRoles(['player']), updatePlayer);
router.delete('/player/:_id', authenticateToken, authorizeRoles(['player']), deletePlayer);

router.post('/owner/login', ownerLoginValidation, ownerLogin);
router.post('/owner/signup', ownerSignupValidation, ownerSignup);
router.put('/owner/:_id', authenticateToken, authorizeRoles(['owner']), updateOwner);
router.delete('/owner/:_id', authenticateToken, authorizeRoles(['owner']), deleteOwner);


module.exports = router;

