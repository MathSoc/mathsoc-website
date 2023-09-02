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
    "server/data/_hidden",
  ];

  private static readonly requiredFiles = [
    "server/data/_hidden/image-list.json",
    "server/data/_hidden/exams-list.json",
    "server/data/_hidden/cartoons-list.json",
    "server/data/_hidden/term-list.json",
    "server/data/_hidden/document-list.json"
  ];

  static prebuild() {
    for (const directory of this.requiredDirectories) {
      if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory);
      }
    }

    for (const file of this.requiredFiles) {
      if (!fs.existsSync(file)) {
        fs.writeFileSync(file, '');
      }
    }
  }
}
