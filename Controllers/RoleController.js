
// const selectRole = (req, res) => {
//     const { role } = req.body;
    
//     if (role === 'player') {
//         res.redirect('/role/player-action'); 
//     } else if (role === 'owner') {
//         res.redirect('/role/owner-action'); 
//     } else {
//         res.status(400).send('Invalid role selected');
//     }
// };

// const playerAction = (req, res) => {
//     const { action } = req.body;
    
//     if (action === 'login') {
//         res.redirect('/auth/player/login'); 
//     } else if (action === 'signup') {
//         res.redirect('/auth/player/signup'); 
//     } else {
//         res.status(400).send('Invalid action selected');
//     }
// };

// const ownerAction = (req, res) => {
//     const { action } = req.body;
    
//     if (action === 'login') {
//         res.redirect('/auth/owner/login'); 
//     } else if (action === 'signup') {
//         res.redirect('/auth/owner/signup'); 
//     } else {
//         res.status(400).send('Invalid action selected');
//     }
// };

// module.exports = {
//     selectRole,
//     playerAction,
//     ownerAction
// };

const selectRole = (req, res) => {
    const { role } = req.body;
    
    if (role === 'player') {
        res.status(200).json({ message: 'Player role selected', next: '/role/player-action' });
    } else if (role === 'owner') {
        res.status(200).json({ message: 'Owner role selected', next: '/role/owner-action' });
    } else {
        res.status(400).json({ message: 'Invalid role selected' });
    }
};

const playerAction = (req, res) => {
    const { action } = req.body;
    
    if (action === 'login') {
        res.status(200).json({ message: 'Player login selected', next: '/auth/player/login' });
    } else if (action === 'signup') {
        res.status(200).json({ message: 'Player signup selected', next: '/auth/player/signup' });
    } else {
        res.status(400).json({ message: 'Invalid action selected' });
    }
};

const ownerAction = (req, res) => {
    const { action } = req.body;
    
    if (action === 'login') {
        res.status(200).json({ message: 'Owner login selected', next: '/auth/owner/login' });
    } else if (action === 'signup') {
        res.status(200).json({ message: 'Owner signup selected', next: '/auth/owner/signup' });
    } else {
        res.status(400).json({ message: 'Invalid action selected' });
    }
};

module.exports = {
    selectRole,
    playerAction,
    ownerAction
};