const router = require('express').Router();
const navItems = require('../config/navbar.json');
const footer = require('../config/footer.json');

router.get('/', async (req, res) => {
    res.render('pages/home', {navItems: navItems, footer: footer});
});

module.exports = router;
