import { Request, Response, Router } from "express";
import fs from "fs";
import path from "path";
import { PageInflow, PageOutflow } from "../types/routing.js";

/**
 * Contains functions related to the construction of new page routes and the population of
 * the pug views those routes redirect to
 */
export class PageLoader {
  static navItems = require("../config/navbar.json");
  static footer = require("../config/footer.json");

  /**
   * Accepts an array of pages, and creates routes to each of their refs.
   * This means that when passed a page with ref '/contact-us', this page makes it such that
   * '/contact-us' is a page that can be accessed in the browser without throwing a 404
   * @param router An express.Router from the page that called it.  This will be exported to be consumed by the app
   * @param dataTransformer A function that customizes the basic data piped to each page.
   */
  static buildRoutes<PageOutflowExtension extends PageOutflow>(
    pageArray: PageInflow[],
    router: Router,
    dataTransformer: (data: PageOutflow) => PageOutflowExtension
  ): void {
    for (const page of pageArray) {
      if (page.ref && !page.noRouting) {
        router.get(page.ref, async (req: Request, res: Response) => {
          const data = this.getAllPageData(page, dataTransformer);
          res.render(`pages/${page.view}.pug`, data);
        });
      }

      if (page.children) {
        PageLoader.buildRoutes(page.children, router, dataTransformer);
      }
    }
  }

  /**
   * @returns The data that gets passed into the pug template for a given page.
   */
  static getAllPageData<PageOutflowExtension extends PageOutflow>(
    page: PageInflow,
    dataTransformer: (data: PageOutflow) => PageOutflowExtension
  ): PageOutflowExtension {
    const pageData: PageOutflow = {
      navItems: PageLoader.navItems,
      footer: PageLoader.footer,
      data: PageLoader.getPageDataSource(page.ref),
      title: page.title,
      ref: page.ref,
    };

    // Load any additional sources of data for the page, such as shared data files
    if (page.dataSources) {
      const sources = Object.keys(page.dataSources);
      pageData.sources = {};
      pageData.dataEndpoints = [];

      for (const source of sources) {
        pageData.dataEndpoints[source] = page.dataSources[source];
        pageData.sources[source] = PageLoader.getPageDataSource(
          `/${page.dataSources[source]}`
        );
      }
    }

    return dataTransformer(pageData);
  }

  /**
   * `require()` automatically caches any data it retrieves.  When the admin backend is used to
   * change the contents of one of the JSON data files, we _do not_ want that cache to be maintained.
   * This deletes the existing cache every time a /data file is accessed, always resulting in the newest
   * data being accessed.
   *
   * @todo We don't actually need to delete the cache every time though, only on changes to the JSON files.
   */
  static getPageDataSource(pageRef?: string): object | any[] | null {
    if (fs.existsSync(`server/data${pageRef}.json`)) {
      const url = path.join(__dirname, `../../server/data/${pageRef}.json`);
      delete require.cache[url];
      return require(`../data${pageRef}.json`);
    } else {
      return null;
    }
  }
}
