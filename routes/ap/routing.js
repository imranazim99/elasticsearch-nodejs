var express = require('express');
const { ensureAuth } = require('../../middleware/auth');
var router = express.Router();

// Admin panel routes
// #import
var loginAuth       = require('../ap/login'),
    dashboard   = require('../ap/dashboard'),
    mobileApi   = require('../ap/mobile'),
    product     = require('../ap/product');

// #use
router.use('/ap/dashboard', dashboard);
router.use('/ap/auth', loginAuth);
router.use('/api/mobile', mobileApi);
router.use('/ap/product', product);


router.get('/ap/*', ensureAuth, (req, res) => {
    res.redirect('/ap/dashboard');
})

module.exports = router;