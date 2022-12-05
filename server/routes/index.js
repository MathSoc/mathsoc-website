const router = require('express').Router();
const routerServices = require('express').Router();
const navItems = require('../data/navbar.json');
const footer = require('../data/footer.json');

router.get('/', async (req, res) => {
    res.render('pages/home', {navItems: navItems, footer: footer});
})

routerServices.get('/', async (req, res) => {
    res.render('pages/services');
})

module.exports = router;
module.exports = routerServices;

