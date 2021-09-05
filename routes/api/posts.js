const express = require('express');
const router = express.Router();

// @route  api/posts
// @desc   Test route for posts
// @access Public

router.route('/').get((req, res) => res.send('Posts route'));

module.exports = router;
