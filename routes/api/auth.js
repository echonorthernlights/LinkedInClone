require('dotenv').config();
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const authMiddleware = require('../../middleware/auth');
const { validationResult } = require('express-validator');
const User = require('../../models/User');
const jwt = require('jsonwebtoken');

// @route  api/auth
// @desc   Test route for auth
// @access Public

router.route('/').get(authMiddleware, async (req, res) => {
  try {
    const { id } = req.user;
    const user = await User.findById(id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error....');
  }
});

// @route  api/auth
// @desc   Authenticate user and get Token
// @access Public

router.route('/').post(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { email, password } = req.body;
  try {
    // Check if user exists
    let user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ errors: [{ msg: 'Invalid Credentials E' }] });
    }
    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res
        .status(400)
        .json({ errors: [{ msg: 'Invalid Credentials P' }] });
    }
    // Return JWToken
    const payload = { user: { id: user.id } };
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      {
        expiresIn: 36000,
      },
      (err, token) => {
        if (err) throw err;
        return res.json({ token });
      }
    );
    await user.save();
    //res.send('User created');
  } catch (error) {
    console.log(error.message);
    res.status(500).send('Server error ....');
  }
});

module.exports = router;
