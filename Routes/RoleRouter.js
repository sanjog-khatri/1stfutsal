

const express = require('express');
const router = express.Router();
const { selectRole, playerAction, ownerAction } = require('../Controllers/RoleController');

router.post('/select', selectRole);

router.post('/player-action', playerAction);

router.post('/owner-action', ownerAction);

module.exports = router;
