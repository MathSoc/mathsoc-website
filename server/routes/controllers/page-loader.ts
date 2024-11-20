import { Request, RequestHandler, Response, Router } from "express";
import fs from "fs";
import { ReadWriteController } from "../../api/controllers/read-write-controller";
import { PageInflow, PageOutflow } from "../../types/routing.js";
import tokens from "../../../config";
import config from "../../../config";

/**
 * Contains functions related to the construction of new page routes and the population of
 * the pug views those routes redirect to
 */
export class PageLoader {
  static navItems = tokens.EXAM_BANK_ONLY
    ? []
    : require("../../config/navbar.json");
  static footer = require("../../data/shared/footer.json");

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
    dataTransformer: (data: PageOutflow) => PageOutflowExtension,
    middleware?: RequestHandler
  ): void {
    for (const page of pageArray) {
      if (config.EXAM_BANK_ONLY && !page.renderInExamBankMode) {
        continue;
      }

      const routeHandler = async (req: Request, res: Response) => {
        const data = await this.getAllPageData(page, dataTransformer);
        res.render(`pages/${page.view}.pug`, data);
      };

      if (page.ref && !page.noRouting) {
        if (middleware) {
          router.get(page.ref, middleware, routeHandler);
        } else {
          router.get(page.ref, routeHandler);
        }
      }

      if (page.children) {
        PageLoader.buildRoutes(
          page.children,
          router,
          dataTransformer,
          middleware
        );
      }
    }
  }

  /**
   * Builds pages associated with items from the `inventory` page.
   * @param items A list of JSON items representing each inventory item, sourced from the data file.
   * @param router An express.Router from the page that called it.  This will be exported to be consumed by the app
   */
  static buildInventoryItemRoutes(items, router: Router) {
    for (const item of items) {
      router.get(
        `/inventory/${item.item.replace(/\s+/g, "-").toLowerCase()}`,
        async (req: Request, res: Response) => {
          const data = {
            navItems: PageLoader.navItems,
            footer: PageLoader.footer,
            data: item,
            title: item.item,
            ref: `/inventory/${item.item.replace(/\s+/g, "-").toLowerCase()}`,
          };
          res.render("pages/inventory/item.pug", data);
        }
      );
    }
  }

  /**
   * @returns The data that gets passed into the pug template for a given page.
   */
  static async getAllPageData<PageOutflowExtension extends PageOutflow>(
    page: PageInflow,
    dataTransformer: (data: PageOutflow) => PageOutflowExtension
  ): Promise<PageOutflowExtension> {
    const pageData: PageOutflow = {
      navItems: PageLoader.navItems,
      footer: PageLoader.footer,
      data: page.ref ? await PageLoader.getPageDataSource(page.ref) : null,
      title: page.title,
      ref: page.ref,
      examBankOnly: tokens.EXAM_BANK_ONLY,
    };

    // Load any additional sources of data for the page, such as shared data files
    if (page.dataSources) {
      const sources = Object.keys(page.dataSources);
      pageData.sources = {};
      pageData.dataEndpoints = [];

      for (const source of sources) {
        pageData.dataEndpoints[source] = page.dataSources[source];
        pageData.sources[source] = (await PageLoader.getPageDataSource(
          `/${page.dataSources[source]}`
        )) as object | any[];
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
  static getPageDataSource(pageRef: string): Promise<unknown> | null {
    const url = `server/data${pageRef}`;
    if (fs.existsSync(`${url}.json`)) {
      const result = new Promise((resolve) => {
        ReadWriteController.getJSONDataPath(pageRef, (statusCode, body) =>
          resolve(body)
        );
      });

      return result;
    } else {
      return null;
    }
  }
}
