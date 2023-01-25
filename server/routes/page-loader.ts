import { Request, Response, Router } from "express";

import fs from "fs";
import path from "path";
import { Page } from "../types/page.js";

interface PipedData {
  navItems;
  footer;
  data?;
  title: string;
  ref?: string;
  sources?: Record<string, object | any[] | null>;
  dataEndpoints?: string[];
}

export class PageLoader {
  static navItems = require("../config/navbar.json");
  static footer = require("../config/footer.json");

  static buildRoutes(
    pageArray: Page[],
    router: Router,
    dataTransformer?: (data: PipedData) => any & PipedData
  ) {
    for (const page of pageArray) {
      if (page.ref) {
        const data = this.getPagePipedData(page, dataTransformer);
        router.get(page.ref, async (req: Request, res: Response) => {
          res.render(`pages/${page.view}.pug`, data);
        });
      }

      if (page.children) {
        PageLoader.buildRoutes(page.children, router, dataTransformer);
      }
    }
  }

  static getPagePipedData(
    page: Page,
    dataTransformer: ((data: PipedData) => any) = (data) => data
  ): PipedData {
    const data: PipedData = {
      navItems: PageLoader.navItems,
      footer: PageLoader.footer,
      data: PageLoader.getPageInputData(page.ref ?? ""),
      title: page.title,
      ref: page.ref,
    };

    // Load any additional sources of data for the page
    if (page.dataSources) {
      const sources = Object.keys(page.dataSources);
      data.sources = {};
      data.dataEndpoints = [];

      for (const source of sources) {
        data.sources[source] = PageLoader.getPageInputData(
          `/${page.dataSources[source]}`
        );
        data.dataEndpoints[source] = page.dataSources[source];
      }
    }

    return dataTransformer(data);
  }

  // require() automatically caches what is retrieved.  This function ensures that cache is erased when relevant.
  static getPageInputData(pageRef?: string): object | any[] | null {
    if (fs.existsSync(`server/data${pageRef}.json`)) {
      const url = path.join(__dirname, `../../server/data/${pageRef}.json`);
      delete require.cache[url];
      return require(`../data${pageRef}.json`);
    } else {
      return null;
    }
  }
}
