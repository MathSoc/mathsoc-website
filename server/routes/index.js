const router = require('express').Router();
const navItems = require('../config/navbar.json');
const footer = require('../config/footer.json');
const electionsData = require('../data/elections.json');

router.get('/', async (req, res) => {
    res.render('pages/home', {navItems: navItems, footer: footer});
});

router.get('/elections', async (req, res) => {
  res.render('pages/elections/elections', {navItems: navItems, footer: footer, elections: electionsData});
})

module.exports = router;
