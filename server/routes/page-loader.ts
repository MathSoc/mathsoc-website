import { Request, Response } from 'express';

const fs = require('fs');
const path = require('path');

class PageLoader {
  static navItems = require('../config/navbar.json');
  static footer = require('../config/footer.json');

  static buildRoutes(pageArray, router) {
    for (const page of pageArray) {
      if (page.ref) {
        router.get(page.ref, async (req: Request, res: Response) => {
          const data = {
            navItems: PageLoader.navItems,
            footer: PageLoader.footer,
            data: PageLoader.getPageData(page.ref),
            title: page.title,
            ref: page.ref,
            sources: null
          };

          // Load any additional sources of data for the page
          if (page.dataSources) {
            const sources = Object.keys(page.dataSources);
            data.sources = {};

            for (const source of sources) {
              data.sources[source] = PageLoader.getPageData(`/${page.dataSources[source]}`);
            }
          }

          res.render(`pages/${page.view}.pug`, data);
        });
      }

      if (page.children) {
        PageLoader.buildRoutes(page.children, router);
      }
    }
  }

  // require() automatically caches what is retrieved.  This function ensures that cache is erased when relevant.
  static getPageData(pageRef: string) {
    if (fs.existsSync(`server/data${pageRef}.json`)) {
      const url = path.join(__dirname, "../../server/data/contact-us.json");
      delete require.cache[url];
      return require(`../data${pageRef}.json`);
    } else {
      return null;
    }
  }
}

module.exports = PageLoader;
