'use strict';


let express = require('express');
let router = express.Router();
const user = require('./user.routes');
const ad = require('./ad.routes')
const app = require('./app.routes');
const category = require('./category.routes');
const blog = require('./blog.routes');
const notification = require('./notification.routes');
const proposal = require('./proposal.routes');

router.use('/ad', ad);
router.use('/auth', user);
router.use('/app', app);
router.use('/blog', blog);
router.use('/category', category);
router.use('/notification', notification);
router.use('/proposal', proposal);
module.exports = router;