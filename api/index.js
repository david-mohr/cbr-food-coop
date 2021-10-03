const express = require('express');

const auth = require('./auth');
const members = require('./members');
const signup = require('./signup');
const users = require('./users');

const router = express.Router();

router.use(signup);
router.use(auth);
router.use('/members', members);
router.use('/users', users);
module.exports = router;
