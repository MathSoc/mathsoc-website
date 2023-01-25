import fs from "fs";
import customPages from "../config/admin/admin-pages.json";
import { Page } from "../types/page";
import { getFormattedURL } from "./util";

type DirectoryEntry =
  | { name: string; type: "page"; ref: string }
  | {
      name: string;
      type: "directory";
      subdirectory: DirectoryEntry[];
      ref: string;
    }
  | DirectoryEntry[];

export class BackendConstructor {
  static getPageStructure(): Page[] {
    const dataDirectory = this.getDataDirectoryStructure();

    const map = mapSubdirectoryLevel(dataDirectory);

    function mapSubdirectoryLevel(level: DirectoryEntry[]): Page[] {
      return level.map(mapSubdirectoryEntry);
    }

    function mapSubdirectoryEntry(entry: DirectoryEntry) {
      if (Array.isArray(entry)) {
        return mapSubdirectoryLevel(entry);
      } else if (entry.type === "page") {
        return {
          title: entry.name,
          ref: `/admin/generic-editor?page=${entry.ref}`,
          view: "/admin/contact-us",
        };
      } else {
        return {
          title: entry.name,
          children: mapSubdirectoryEntry(entry.subdirectory) as Page[],
        };
      }
    }

    const result = map.concat(customPages);

    return result;
  }

  static getDataDirectoryStructure() {
    return this.getDirectoryStructure("server/data");
  }

  private static getDirectoryStructure(
    path: string,
    options?: {
      root: string;
    }
  ): DirectoryEntry[] {
    if (!options) {
      return this.getDirectoryStructure(path, { root: path });
    }

    const directoryEntries = fs.readdirSync(path, {
      withFileTypes: true,
    });
    const directory: DirectoryEntry = [];

    for (const entry of directoryEntries) {
      const pathToEntry = `${path}/${entry.name}`;
      const ref = options?.root
        ? pathToEntry.replace(options.root + "/", "")
        : pathToEntry;
      if (entry.isDirectory()) {
        directory.push({
          name: getFormattedURL(entry.name),
          type: "directory",
          subdirectory: this.getDirectoryStructure(pathToEntry, options),
          ref: ref,
        });
      } else {
        directory.push({
          name: getFormattedURL(entry.name),
          type: "page",
          ref: ref,
        });
      }
    }

    // Sorting idea: sort alphabetically, but push directories (arrays) to the end of the list
    const sorted = directory.sort((a, b) => {
      const isADirectory = Array.isArray(a);
      const isBDirectory = Array.isArray(b);

      if (isADirectory && isBDirectory) {
        // should not occur
        return 0;
      } else if (!isADirectory && isBDirectory) {
        return -1; // a first
      } else if (isADirectory && !isBDirectory) {
        return 1; // b first
      } else if (!isADirectory && !isBDirectory) {
        if (a.type === b.type) {
          return a.name < b.name ? -1 : 1;
        } else if (a.type === "page") {
          return -1;
        } else {
          return 1;
        }
      }

      return -1;
    });

    return sorted;
  }
}
