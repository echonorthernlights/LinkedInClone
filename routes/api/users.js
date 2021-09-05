const express = require('express');
require('dotenv').config();

const router = express.Router();
const { check, validationResult } = require('express-validator');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const User = require('../../models/User');
const jwt = require('jsonwebtoken');
// @route  api/users
// @desc   Test route for users
// @access Public

router
  .route('/')
  .post(
    [
      check('name', 'Name is required').not().isEmpty(),
      check('email', 'Provide a correct email').isEmail(),
      check('password', 'Password must contain 6 characters at least').isLength(
        { min: 6 }
      ),
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const { name, email, password } = req.body;
      try {
        // Check if user exists
        let user = await User.findOne({ email });
        if (user) {
          return res
            .status(400)
            .json({ errors: [{ msg: 'User already exists' }] });
        }
        // get avatar image link
        const avatar = gravatar.url(email, {
          s: '200',
          r: 'pg',
          d: 'mm',
        });

        user = new User({ name, email, avatar, password });
        // Salt
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
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
    }
  );

module.exports = router;
