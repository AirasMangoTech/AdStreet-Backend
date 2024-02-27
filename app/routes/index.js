'use strict';


let express = require('express');
let router = express.Router();
const user = require('./user.routes');
const ad = require('./ad.routes');
const admin = require('./admin.routes')
const app = require('./app.routes');
const category = require('./category.routes');
const geo = require('./geo.routes');
const blog = require('./blog.routes');
const industry = require('./industry.routes');
const notification = require('./notification.routes');
const proposal = require('./proposal.routes');
const portfolio = require('./portfolio.routes');
const service = require('./service.routes');

router.use('/ad', ad);
router.use('/admin', admin);
router.use('/auth', user);
router.use('/app', app);
router.use('/blog', blog);
router.use('/category', category);
router.use('/geo', geo);
router.use('/industry', industry);
router.use('/notification', notification);
router.use('/portfolio', portfolio)
router.use('/proposal', proposal);
router.use('/service', service);
module.exports = router;