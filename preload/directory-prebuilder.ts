import fs from "fs";

/**
 * Prebuilds any folders required by the server but not included in the github repository
 */
export class DirectoryPrebuilder {
  private static readonly requiredDirectories = [
    "public/assets/documents",
    "public/assets/img/uploads",
    "public/assets/img/cartoons/uploads",
    "public/exams",
    "server/data",
  ];

  static async prebuild(): Promise<void> {
    for (const directory of this.requiredDirectories) {
      if (!fs.existsSync(directory)) {
        console.info(`Creating folder: ${directory}`);
        await fs.promises.mkdir(directory);
      }
    }
  }
}
