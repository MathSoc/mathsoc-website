const router = require('express').Router();

router.get('/', async (req, res) => {
    res.render('pages/home');
})

module.exports = router;