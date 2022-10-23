const RequestHandler = require('./request-handler.js');
const router = require('express').Router();

router.get('/:fileName', (req, res) => {
  RequestHandler.getJSONData(req, res);
});

router.post('/:fileName', (req, res) => {
  RequestHandler.overwriteJSONData(req, res);
});

module.exports = router;
