const RequestController = require('./request-controller.js');
const ContactUsController = require('./contact-us-controller.js');
const router = require('express').Router();
const navItems = require('../config/navbar.json');
const footer = require('../config/footer.json');

router.get('/data/:fileName', (req, res) => {
  RequestController.getJSONData(req, res);
});

router.post('/data/:fileName', (req, res) => {
  RequestController.overwriteJSONData(req, res);
});

router.post('/general-inquiries', (req, res) => {
  ContactUsController.handleRequest(req, res);
  // If the res hasn't been closed by bad input, then redirect to success page
  res.render('pages/contact-us/contact-us-success', { navItems: navItems, footer: footer });
});

module.exports = router;
