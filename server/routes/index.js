const fs = require('fs');

const router = require('express').Router();

const pages = require('../config/pages.json');
const navItems = require('../config/navbar.json');
const footer = require('../config/footer.json');

function buildRoutes(pageArray) {
  for (const page of pageArray) {
    if (page.ref) {
      let data = null;

      if(page.data) {
        data = require(`../data${page.data}.json`);
      } else {
        const dataURL = `../data${page.ref}.json`;
        if (fs.existsSync(`server/data${page.ref}.json`)) {
          data = require(dataURL);
        }
      }
      
      router.get(page.ref, async (req, res) => {
        res.render(`pages/${page.view}.pug`, { navItems: navItems, footer: footer, data: data, title: page.title });
      });
    }

    if (page.children) {
      buildRoutes(page.children);
    }
  }
}

buildRoutes(pages);

module.exports = router;
