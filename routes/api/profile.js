const express = require('express');
const router = express.Router();

// @route  api/profile
// @desc   Test route for user profile
// @access Public

router.route('/').get((req, res) => res.send('User profile route'));

module.exports = router;
