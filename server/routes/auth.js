const router = require('express').Router();
const pages = require('../config/auth-pages.json');
const PageLoader = require('./page-loader.js');

PageLoader.buildRoutes(pages, router);

module.exports = router;
