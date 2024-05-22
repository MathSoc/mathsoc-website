import fs from "fs";
import path from "path";

export class DataFiller {
  /**
   * For any file in /data-base that doesn't exist in /data,
   * creates a version of that file in /data
   */
  static async fillDataFolder() {
    await DataFiller.fillDataFolderRecurse([]);
  }

  static async fillDataFolderRecurse(relativePath: string[]) {
    const baseDir: string[] = await fs.promises.readdir(
      path.join("server", "data-base", ...relativePath)
    );
    const realDir: string[] = await fs.promises.readdir(
      path.join("server", "data", ...relativePath)
    );

    // for every file or subdirectory in baseDir
    for (const fileName of baseDir) {
      const pathToBaseFile = path.join(
        "server",
        "data-base",
        ...relativePath,
        fileName
      );
      const pathToRealFile = path.join(
        "server",
        "data",
        ...relativePath,
        fileName
      );

      // if it doesn't exist in our real data folder
      if (!realDir.includes(fileName)) {
        if ((await fs.promises.stat(pathToBaseFile)).isDirectory()) {
          console.info(
            `Creating real data folder: ${relativePath.join("/")}/${fileName}`
          );
          await fs.promises.mkdir(pathToRealFile);
        } else {
          console.info(
            `Copying to real data file: ${relativePath.join("/")}/${fileName}`
          );
          await fs.promises.copyFile(pathToBaseFile, pathToRealFile);
        }
      }
    }

    // call recursively on all subdirectories
    for (const fileName of baseDir) {
      const pathToFile = path.join("server", "data", ...relativePath, fileName);

      if ((await fs.promises.stat(pathToFile)).isDirectory()) {
        // if it's a subdirectory, recreate the subdirectory in the real folder
        await this.fillDataFolderRecurse(relativePath.concat(fileName));
      }
    }
  }
}
