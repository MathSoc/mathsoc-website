const router = require('express').Router();
const navItems = require('../config/navbar.json');
const footer = require('../config/footer.json');
const electionsData = require('../data/elections.json');
const wellnessData = require('../data/wellness.json');

router.get('/', async (req, res) => {
    res.render('pages/home', {navItems: navItems, footer: footer});
});

router.get('/elections', async (req, res) => {
  res.render('pages/elections/elections', {navItems: navItems, footer: footer, elections: electionsData});
})

router.get('/mental-wellness', async (req, res) => {
  res.render('pages/resources/mental-wellness', {navItems: navItems, footer: footer, wellness: wellnessData});
})

module.exports = router;
