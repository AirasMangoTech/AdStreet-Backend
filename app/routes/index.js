'use strict';

let express = require('express');
let router = express.Router();
const user = require('./user.routes');
const app = require('./app.routes');

router.use('/auth', user);
router.use('/app', app);

module.exports = router;