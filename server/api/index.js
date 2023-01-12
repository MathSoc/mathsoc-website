const RequestController = require('./read-write-controller.js');
const ContactUsController = require('./contact-us-controller.js');
const AdminControllers = {
  ContactUs: require('./admin/contact-us.js'),
};

const router = require('express').Router();
const navItems = require('../config/navbar.json');
const footer = require('../config/footer.json');

router.get('/data/:fileName', (req, res) => {
  RequestController.getJSONData(req.params.fileName, res);
});

router.post('/data/:fileName', (req, res) => {
  RequestController.overwriteJSONData(req.params.fileName, res, req.body);
});

router.post('/admin/contact-us/execs', (req, res) => {
  AdminControllers.ContactUs.updateExecs(req, res);
});

router.post('/general-inquiries', (req, res) => {
  const success = ContactUsController.handleRequest(req, res);
  // If the res hasn't been closed by bad input, then redirect to success page
  if (success) {
    res.render('pages/contact-us/contact-us-success', { navItems: navItems, footer: footer });
  }
});

module.exports = router;
