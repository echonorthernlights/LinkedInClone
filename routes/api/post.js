const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');
const POST = require('../../models/Post');
const User = require('../../models/User');
const Post = require('../../models/Post');

// @route  GET api/posts
// @desc   Get all posts
// @access Public

router.route('/').get(async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });
    res.json(posts);
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'No post found' });
    }
    console.log(error.message);
    res.send(500).send('Server error ....');
  }
});

// @route  GET api/posts/:postID
// @desc   Get post by ID
// @access Private

router.route('/:postID').get(authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postID);
    if (!post) {
      return res.status(404).json({ msg: 'No post found' });
    }
    res.json(post);
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'No post found' });
    }
    console.log(error.message);
    res.send(500).send('Server error ....');
  }
});

// @route  DELETE api/posts/:postID
// @desc   Delete post by ID
// @access Private

router.route('/:postID').delete(authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postID);
    if (!post) {
      return res.status(404).json({ msg: 'No post found' });
    }

    // check if the post belongs to the logged in user
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }
    await post.remove();
    res.json({ msg: 'Post removed successfully !!' });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'No post found' });
    }
    console.log(error.message);
    res.status(500).send('Server error ....');
  }
});

// @route  POST api/post
// @desc   Add a post
// @access Private

router
  .route('/')
  .post(
    authMiddleware,
    [check('text', 'Text is required').not().isEmpty()],
    async (req, res) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.json({ error: errors.array() });
        }
        const { text, name, avatar, likes, comments, date } = req.body;

        const user = await User.findById(req.user.id).select('-password');

        const newPost = new POST({
          user: req.user.id,
          text: req.body.text,
          name: user.name,
          avatar: user.avatar,
        });

        const post = await newPost.save();
        res.json(post);
      } catch (error) {
        console.log(error.message);
        res.status(500).send('Server error ...');
      }
    }
  );

// @route  PUT api/posts/like/:id
// @desc   Like a post
// @access Private

router.route('/like/:id').put(authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id).length >
      0
    ) {
      return res.json({ msg: 'Already liked this post' });
    }
    post.likes.unshift({ user: req.user.id });

    await post.save();
    res.json(post.likes);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error ....');
  }
});

// @route  PUT api/posts/unlike/:id
// @desc   Unlike a post
// @access Private

router.route('/unlike/:id').put(authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id)
        .length === 0
    ) {
      return res.status(400).json({ msg: 'Still have not liked this post' });
    }

    const removeIndex = post.likes
      .map((like) => {
        like.user.toString();
      })
      .indexOf(req.user.id);

    post.likes.splice(removeIndex, 1);

    await post.save();
    res.json(post.likes);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error ....');
  }
});

// @route  POST api/post/comment/:id
// @desc   Add a post
// @access Private

router
  .route('/comment/:id')
  .post(
    authMiddleware,
    [check('text', 'Text is required').not().isEmpty()],
    async (req, res) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.json({ error: errors.array() });
        }
        const user = await User.findById(req.user.id).select('-password');
        const post = await Post.findById(req.params.id);

        const newComment = {
          user: req.user.id,
          text: req.body.text,
          name: user.name,
          avatar: user.avatar,
        };
        post.comments.unshift(newComment);
        await post.save();
        res.json(post.comments);
      } catch (error) {
        console.log(error.message);
        res.status(500).send('Server error ...');
      }
    }
  );
// @route  POST api/post/comment/:d
// @desc   Add a post
// @access Private

router
  .route('/comment/:id/:comment_id')
  .delete(authMiddleware, async (req, res) => {
    try {
      //const user = await User.findById(req.user.id).select('-password');
      const post = await Post.findById(req.params.id);

      // Pull the comment
      const comment = post.comments.find(
        (comment) => comment.id === req.params.comment_id
      );
      if (!comment) {
        return res.status(404).json({ msg: 'Comment does not exist' });
      }

      if (req.user.id !== comment.user.toString()) {
        return res.status(401).json({ msg: 'Not authorized' });
      }

      // Get remove index

      const removeIndex = post.comments
        .map((comment) => {
          comment.user.toString();
        })
        .indexOf(req.user.id);

      post.comments.splice(removeIndex, 1);

      await post.save();
      res.json(post.comments);
    } catch (error) {
      console.log(error.message);
      res.status(500).send('Server error ...');
    }
  });

module.exports = router;
