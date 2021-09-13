require('dotenv').config();
require('express-async-errors');

const express = require('express');
const app = express();
const connectDB = require('./db/connect');
const userRouter = require('./routes/api/users');
const authRouter = require('./routes/api/auth');
const profileRouter = require('./routes/api/profile');
const postRouter = require('./routes/api/post');
// Init middleware
app.use(express.json());
// Routes
app.use('/api/users', userRouter);
app.use('/api/auth', authRouter);
app.use('/api/profile', profileRouter);
app.use('/api/post', postRouter);

const start = async () => {
  try {
    const PORT = process.env.PORT || 5000;
    await connectDB(process.env.MONGO_URI);
    app.listen(PORT, (req, res) => {
      console.log('Server running on PORT ', PORT);
    });
  } catch (error) {
    console.log(error);
  }
};

start();
