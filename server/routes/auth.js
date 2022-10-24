const router = require('express').Router();

router.get('/cms', async (req, res) => {
    res.render('pages/home');
})

module.exports = router;
