var express = require('express'),
    Product    = require("../../models/ap/product");
const { ensureAuth } = require('../../middleware/auth');
var router = express.Router();

// This will show index page
router.get('/', ensureAuth, (req, res) => {
    Promise.all([
        Product.count()
    ]).then(([products]) => {
        res.render('ap/dashboard',{
            successFlash: req.flash('success'),
            errorFlash: req.flash('error'),
            title: "Home",
            products: products
        });
    })
})

module.exports = router;