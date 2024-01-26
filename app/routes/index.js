'use strict';

let express = require('express');
let router = express.Router();
const user = require('./user.routes');
const app = require('./app.routes');
const category = require('./category.routes')


router.use('/auth', user);
router.use('/app', app);
router.use('/category', category)
module.exports = router;