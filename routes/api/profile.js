require('dotenv').config();
const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const { check, validationResult } = require('express-validator');
const request = require('request');

// @route  GET api/profile/me
// @desc   Get current users profile
// @access Private

router.route('/me').get(authMiddleware, async (req, res) => {
  try {
    console.log(req.user.id);
    const profile = await Profile.findOne({ user: req.user.id }).populate(
      'user',
      ['name', 'avatar']
    );
    console.log(profile);
    if (!profile) {
      return res.status(400).json({ msg: 'There is no profile for this user' });
    }
    res.status(200).json(profile);
  } catch (error) {
    console.error(error.message);
    res.status(400).json({ msg: 'Server error ....' });
  }
});

// @route  GET api/profile/me
// @desc   Get current users profiles
// @access Public

router.route('/').get(async (req, res) => {
  try {
    const profiles = await Profile.find().populate('user', ['name', 'avatar']);
    res.json(profiles);
  } catch (error) {
    console.log(error.message);
    res.status(500).send('Server error ...');
  }
});

// @route  DELETE api/profile/user/:userID
// @desc   Delete user + profile + posts
// @access Private

router.route('/').delete(authMiddleware, async (req, res) => {
  try {
    console.log(req);
    const userID = req.user.id;
    // @todo delete posts

    // delete user
    await Profile.findOneAndRemove({ user: userID });

    //delete profile
    await User.findOneAndRemove({ _id: userID });

    res.json({ msg: 'User deleted successfully !!' });
  } catch (error) {
    console.log(error.message);
    res.status(500).send('Server error ...');
  }
});

// @route  GET api/profile/user/:userID
// @desc   Get profile by user ID
// @access Public

router.route('/user/:userID').get(async (req, res) => {
  try {
    const userID = req.params.userID;
    // if (!userID) {
    //   return res.status(401).json({ msg: 'There is no ID provided' });
    // }
    const profile = await Profile.findOne({ user: userID }).populate('user', [
      'name',
      'avatar',
    ]);
    if (!profile) {
      return res.status(401).json({ msg: 'Profile not found' });
    }
    res.json(profile);
  } catch (error) {
    console.log(error.message);
    if (error.kind == 'ObjectId') {
      return res.status(401).json({ msg: 'Profile not found' });
    }
    res.status(500).send('Server error ...');
  }
});
// @route  DELETE api/profile/experience/:expercienceID
// @desc   Delete user + profile + posts
// @access Private
router
  .route('/experience/:experienceID')
  .delete(authMiddleware, async (req, res) => {
    try {
      const profile = await Profile.findOne({ user: req.user.id });
      // Get remove Index
      const removeIndex = profile.experience
        .map((item) => item.id)
        .indexOf(req.params.experienceID);
      profile.experience.splice(removeIndex, 1);

      await profile.save();
      return res.json(profile);
    } catch (error) {
      res.status(500).send('Server error ....');
      console.error(error.message);
    }
  });

// @route  PUT api/profile/experience
// @desc   Add experience to user profile
// @access Private
router
  .route('/experience')
  .put(
    [
      authMiddleware,
      [
        check('title', 'Title is required').not().isEmpty(),
        check('company', 'Company is required').not().isEmpty(),
        check('from', 'From date is required').not().isEmpty(),
      ],
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const { title, company, from, to, location, current, description } =
        req.body;
      const newExperience = {
        title,
        company,
        from,
        to,
        location,
        current,
        description,
      };
      try {
        const profile = await Profile.findOne({ user: req.user.id });
        profile.experience.unshift(newExperience);
        profile.save(newExperience);

        res.status(200).json(profile);
      } catch (error) {
        console.error(error.message);

        res.status(500).send('Server error ....');
      }
    }
  );

// @route  POST api/profile
// @desc   Create or update a users profile
// @access Private
router
  .route('/')
  .post(
    [
      authMiddleware,
      [
        check('status', 'Status is required').not().isEmpty(),
        check('skills', 'Skills is required').not().isEmpty(),
      ],
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const {
        company,
        website,
        status,
        location,
        skills,
        bio,
        githubusername,
        twitter,
        facebook,
        instagram,
        linkedin,
        youtube,
      } = req.body;
      // Build profile object
      const profileFields = {};

      profileFields.user = req.user.id;
      if (company) profileFields.company = company;
      if (website) profileFields.website = website;
      if (status) profileFields.status = status;
      if (location) profileFields.location = location;
      if (bio) profileFields.bio = bio;
      if (githubusername) profileFields.githubusername = githubusername;

      if (skills)
        profileFields.skills = skills.split(',').map((skill) => skill.trim());
      // Build social object

      profileFields.social = {};
      if (twitter) profileFields.social.twitter = twitter;
      if (instagram) profileFields.social.instagram = instagram;
      if (facebook) profileFields.social.facebook = facebook;
      if (linkedin) profileFields.social.linkedin = linkedin;
      if (youtube) profileFields.social.youtube = youtube;

      try {
        let profile = await Profile.findOne({ user: req.user.id });
        if (profile) {
          // Update
          profile = await Profile.findOneAndUpdate(
            { user: req.user.id },
            { $set: profileFields },
            { new: true }
          );
          return res.json(profile);
        }
        // Create
        profile = new Profile(profileFields);
        await profile.save();
        res.json(profile);
      } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error ...');
      }
    }
  );
// @route  PUT api/profile/education
// @desc   Add education to user profile
// @access Private
router
  .route('/education')
  .put(
    [
      authMiddleware,
      [
        check('school', 'School is required').not().isEmpty(),
        check('degree', 'Degree is required').not().isEmpty(),
        check('fieldofstudy', 'Field of study is required').not().isEmpty(),
      ],
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const { school, degree, fieldofstudy, from, to, current, description } =
        req.body;
      const newEducation = {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description,
      };
      try {
        const profile = await Profile.findOne({ user: req.user.id });
        profile.education.unshift(newEducation);
        profile.save(newEducation);

        res.status(200).json(profile);
      } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error ....');
      }
    }
  );
// @route  DELETE api/profile/education/:educationID
// @desc   Delete education from a user
// @access Private
router
  .route('/experience/:educationID')
  .delete(authMiddleware, async (req, res) => {
    try {
      const profile = await Profile.findOne({ user: req.user.id });
      // Get remove Index
      const removeIndex = profile.education
        .map((item) => item.id)
        .indexOf(req.params.educationID);
      profile.education.splice(removeIndex, 1);

      await profile.save();
      return res.json(profile);
    } catch (error) {
      res.status(500).send('Server error ....');
      console.error(error.message);
    }
  });

// @route GET api/profile/github/users/:userID
// @desc Get Github repositories
// @access Public

router.route('/github/:username').get(async (req, res) => {
  try {
    const options = {
      uri: `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc&client_id=${process.env.githubClientID}&client_secret=${process.env.githubClientSecret}`,
      method: 'GET',
      headers: {
        'user-agent': 'node.js',
      },
    };

    const repos = await request(options, (error, response, body) => {
      if (error) console.error(error.message);
      if (response.statusCode !== 200) {
        return res
          .status(404)
          .json({ msg: 'No github profile was founded !!!!' });
      }

      res.json(JSON.parse(body));
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).send('Server error ....');
  }
});

module.exports = router;
