import fs, { Dirent } from "fs";
import { ReadWriteController } from "./read-write-controller";
import { Logger } from "../../util/logger";

type CartoonsDirectoryStructure = Record<
  string,
  Record<string, Record<string, string[]>>
>;

export class CartoonsController {
  static logger = new Logger("Cartoons");

  static async rewriteFile(): Promise<void> {
    const url = "_hidden/cartoons-list";
    const fullPath = `server/data/${url}.json`;

    if (!fs.existsSync(fullPath)) {
      fs.writeFileSync(fullPath, "");
    }

    const cartoonsUploadPath = "public/assets/img/cartoons/uploads";
    if (!fs.existsSync(cartoonsUploadPath)) {
      fs.mkdirSync(cartoonsUploadPath);
    }

    const cartoonsList = await this.readExamsFromDirectory();

    ReadWriteController.overwriteJSONDataPath(
      url,
      (statusCode: number) => {
        switch (statusCode) {
          case 400:
            this.logger.error(`Bad request made`);
            break;
          case 403:
            this.logger.error(`Forbidden`);
            break;
          case 404:
            this.logger.error(`${url} not found`);
            break;
          default:
            if (statusCode.toString()[0] === "2") {
              // 2XX success codes
              this.logger.info("Cartoons file rewritten");
              break;
            } else {
              this.logger.warn("Unexpected cartoons file rewrite result");
            }
        }
      },
      cartoonsList
    );
  }

  /**
   * @returns A map of the following pattern:
   * {
   *   "math": {
   *     135: {
   *       "Principle of Mathematical Induction": [
   *          "1.jpg", "2.jpg"
   *        },
   *     ],
   *     137: {
   *       "Delta Epsilon Proofs": [
   *          "1.jpg", "2.jpg"
   *        ],
   *     },
   *   },
   *   "cs": {...},
   *   "co": {...},
   * }
   */

  private static async readExamsFromDirectory(): Promise<CartoonsDirectoryStructure> {
    const readCartoonsDir = (url: string) =>
      new Promise<fs.Dirent[]>((resolve, reject) => {
        fs.readdir(
          `public/assets/img/cartoons/uploads${url}`,
          {
            withFileTypes: true,
          },
          (err, files) => {
            if (err) {
              reject(err);
            } else {
              resolve(files);
            }
          }
        );
      });

    const subjects: Dirent[] = await readCartoonsDir("");

    // elements follow pattern of "/math/137"
    const courses: { subject: string; course: string }[][] = [];
    const resultMap: CartoonsDirectoryStructure = {};

    await Promise.all(
      subjects.map(async (subject: Dirent) => {
        const coursesInDirectory = await readCartoonsDir(`/${subject.name}`);
        courses.push(
          coursesInDirectory.map((dirent) => ({
            subject: subject.name,
            course: dirent.name,
          }))
        );
      })
    );

    const flattenedCourses = courses.flat();
    const cartoons: {
      subject: string;
      course: string;
      cartoonDirectory: string;
    }[][] = [];

    await Promise.all(
      flattenedCourses.map(async ({ subject, course }) => {
        const cartoonsForCourse = await readCartoonsDir(
          `/${subject}/${course}`
        );

        if (!resultMap[subject]) {
          resultMap[subject] = {};
        }

        cartoons.push(
          cartoonsForCourse.map((cartoon: Dirent) => ({
            subject,
            course,
            cartoonDirectory: cartoon.name,
          }))
        );
      })
    );

    const flattenedCartoons = cartoons.flat();

    await Promise.all(
      flattenedCartoons.map(async ({ subject, course, cartoonDirectory }) => {
        const filesForCartoon = await readCartoonsDir(
          `/${subject}/${course}/${cartoonDirectory}`
        );

        if (!resultMap[subject]) {
          resultMap[subject] = {};
        }

        if (!resultMap[subject][course]) {
          resultMap[subject][course] = {};
        }

        resultMap[subject][course][cartoonDirectory] = filesForCartoon.map(
          (dirent: Dirent) => dirent.name
        );
      })
    );

    return resultMap;
  }
}
