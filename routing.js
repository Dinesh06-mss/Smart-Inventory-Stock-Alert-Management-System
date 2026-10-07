var express = require('express');
var router = express.Router();

router.get('/linkedin', function(req, res) {
    res.redirect('https://www.linkedin.com/company/unicommerce/');
});

router.get('/instagram', function(req, res) {
    res.redirect('https://www.instagram.com/unicommerce_1/');
});
module.exports = router;