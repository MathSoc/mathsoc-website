import fs from "fs";

/**
 * Prebuilds any folders required by the server but not included in the github repository
 */
export class DirectoryPrebuilder {
  private static readonly requiredDirectories = [
    "public/exams",
    "public/assets/img/uploads",
    "server/data/_hidden",
  ];

  static prebuild() {
    for (const directory of this.requiredDirectories) {
      if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory);
      }
    }
  }
}
