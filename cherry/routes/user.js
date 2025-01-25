const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// User dashboard route
router.get('/user-dashboard', protect, (req, res) => {
    res.send('User Dashboard');
});

module.exports = router;