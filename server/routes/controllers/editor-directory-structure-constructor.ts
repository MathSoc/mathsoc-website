import fs from "fs";
import customPages from "../../config/admin/admin-pages.json";
import { DirectoryEntry, PageInflow } from "../../types/routing";
import { getFormattedURL } from "../../util/util";

/**
 * Constructs the /admin/editor menu structure
 */
export class EditorDirectoryStructureConstructor {
  /**
   * @returns The Pages required to create admin editor pages for each JSON file in the data folder.
   */
  static getPageStructure(): PageInflow[] {
    const dataDirectory = this.getDataDirectoryStructure();

    const map = mapSubdirectoryLevel(dataDirectory);

    function mapSubdirectoryLevel(level: DirectoryEntry[]): PageInflow[] {
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
          children: mapSubdirectoryEntry(entry.subdirectory) as PageInflow[],
        };
      }
    }

    return map.concat(customPages);
  }

  /**
   * @returns A data structure representing the structure of the /data directory
   */
  static getDataDirectoryStructure(): DirectoryEntry[] {
    return this.getDirectoryStructure("server/data");
  }

  /**
   * @returns A data structure representing the structure of the directory found at the indicated path
   * @param path The relative path to the directory (e.g. server/data)
   * @param options **SHOULD NOT BE PASSED IN FROM EXTERNAL CALLS.**  This
   * is used recursively to keep track of the directory we want the structure of.
   */
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
      if (
        entry.isFile() &&
        entry.name.split(".")[entry.name.split(".").length - 1] !== "json"
      ) {
        continue;
      }

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

    return this.sortDirectoryEntries(directory);
  }

  /**
   * Sorts DirectoryEntries alphabetically, but pushes directories (arrays) to the end of the list and files (not arrays) to the beginning of the list
   */
  private static sortDirectoryEntries(
    directory: DirectoryEntry[]
  ): DirectoryEntry[] {
    return directory.sort((a: DirectoryEntry, b: DirectoryEntry) => {
      const is_A_A_Directory = Array.isArray(a);
      const is_B_A_Directory = Array.isArray(b);

      if (is_A_A_Directory && is_B_A_Directory) {
        // should not occur
        return 0;
      } else if (!is_A_A_Directory && is_B_A_Directory) {
        return -1; // a first
      } else if (is_A_A_Directory && !is_B_A_Directory) {
        return 1; // b first
      } else if (!is_A_A_Directory && !is_B_A_Directory) {
        if (a.type === b.type) {
          return a.name < b.name ? -1 : 1;
        } else if (a.type === "page") {
          return -1;
        } else {
          return 1;
        }
      }

      throw new Error(`Sorting algorithm failed to sort two DirectoryEntries.`);
    });
  }
}
