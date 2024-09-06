const selectRole = (req, res) => {
    const { role } = req.body;
    
    console.log(`Role selected: ${role}`);
    
    if (role === 'player') {
        console.log('Redirecting to player action');
        res.redirect('/role/player-action'); 
    } else if (role === 'owner') {
        console.log('Redirecting to owner action');
        res.redirect('/role/owner-action'); 
    } else {
        console.warn('Invalid role selected:', role);
        res.status(400).send('Invalid role selected');
    }
};

const playerAction = (req, res) => {
    const { action } = req.body;
    
    console.log(`Player action selected: ${action}`);
    
    if (action === 'login') {
        console.log('Redirecting to player login');
        res.redirect('/auth/player/login'); 
    } else if (action === 'signup') {
        console.log('Redirecting to player signup');
        res.redirect('/auth/player/signup'); 
    } else {
        console.warn('Invalid action selected for player:', action);
        res.status(400).send('Invalid action selected');
    }
};

const ownerAction = (req, res) => {
    const { action } = req.body;
    
    console.log(`Owner action selected: ${action}`);
    
    if (action === 'login') {
        console.log('Redirecting to owner login');
        res.redirect('/auth/owner/login'); 
    } else if (action === 'signup') {
        console.log('Redirecting to owner signup');
        res.redirect('/auth/owner/signup'); 
    } else {
        console.warn('Invalid action selected for owner:', action);
        res.status(400).send('Invalid action selected');
    }
};

module.exports = {
    selectRole,
    playerAction,
    ownerAction
};
