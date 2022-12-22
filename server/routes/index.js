const router = require('express').Router();
const navItems = require('../config/navbar.json');
const footer = require('../config/footer.json');
const electionsData = require('../data/elections.json');
const execsData = require('../data/execs.json');

router.get('/', async (req, res) => {
    res.render('pages/home', {navItems: navItems, footer: footer});
});

router.get('/elections', async (req, res) => {
  res.render('pages/elections/elections', {navItems: navItems, footer: footer, elections: electionsData});
});

router.get('/contact-us', async (req, res) => {
  res.render('pages/contact-us', {navItems: navItems, footer: footer, staff: execsData });
});

module.exports = router;
