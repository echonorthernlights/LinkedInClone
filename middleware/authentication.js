require('dotenv').config();
const jwt = require('jsonwebtoken');

const {
  badRequestError,
  CustomAPIError,
  notFoundError,
  Unauthenticated,
} = require('../errors');
const authMiddleware = async (req, res, next) => {
  // get token
  const { token } = req.headers.authorization;
  if (!token) {
    throw new badRequestError('No token provided');
  }
  // decode token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = decoded.user;
    next();
  } catch (error) {
    res.status(400).json({ msg: 'Token invalid' });
  }
};

module.exports = authMiddleware;
