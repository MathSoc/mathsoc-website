const router = require('express').Router();

// This is an example api route, they will be used for fetching data from cms
// visit http://localhost:3000/api/example to view this response
router.get('/example', (req, res) => {
    res.json({'status': 'pass'});
})


module.exports = router;