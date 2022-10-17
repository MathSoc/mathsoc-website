const router = require('express').Router();

router.get('/', async (req, res) => {
    res.render('home/home');
})

module.exports = router;