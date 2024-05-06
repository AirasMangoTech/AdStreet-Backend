'use strict';


let express = require('express');
let router = express.Router();
const user = require('./user.routes');
const ad = require('./ad.routes');
const admeet = require('./admeet.routes');
const adpro = require('./adpro.routes');
const admin = require('./admin.routes')
const app = require('./app.routes');
const category = require('./category.routes');
const geo = require('./geo.routes');
const blog = require('./blog.routes');
const banner = require('./banner.routes');
const industry = require('./industry.routes');
const notification = require('./notification.routes');
const proposal = require('./proposal.routes');
const portfolio = require('./portfolio.routes');
const promoOffer = require('./promoOffer.routes');
const service = require('./service.routes');

router.use('/ad', ad);
router.use('/admeet', admeet);
router.use('/adpro', adpro);
router.use('/admin', admin);
router.use('/auth', user);
router.use('/app', app);
router.use('/blog', blog);
router.use('/banner', banner);
router.use('/category', category);
router.use('/geo', geo);
router.use('/industry', industry);
router.use('/notification', notification);
router.use('/portfolio', portfolio)
router.use('/proposal', proposal);
router.use('/promoOffer', promoOffer);
router.use('/service', service);
module.exports = router;