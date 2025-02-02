import { Dirent, readdirSync } from "fs";
import { Exam } from "../../types/exam-bank";
import { Logger } from "../../util/logger";
import { ReadWriteController } from "./read-write-controller";
import fs from "fs";
import { TermNameController } from "./term-name-controller";
import { FileArray } from "express-fileupload";
import path from "path";
import { existsSync, renameSync } from "fs";

/**
 * Current invariants (could be changed later with added work)
 * - All exams are PDFs
 * - Exams' "natural names" do not contain the terms "-sol" or "-hidden"
 *
 * - Exam names are of the pattern: <department>-<course number>-<term number>-<unique title>[-hidden][-sol].pdf
 *     CS-136-1245-midterm.pdf
 *     CS-136-1245-midterm-hidden.pdf
 *     MATH-239-1219-quiz-2-sol.pdf
 */

export class ExamBankController {
  static logger = new Logger("Exam Bank Controller");

  static async hideExamFile(examName: string): Promise<void> {
    examName = examName.replace("-hidden", "").replace(".pdf", "");

    const currentUrl = `public/exams/${examName}.pdf`;
    const newUrl = `public/exams/${examName}-hidden.pdf`;

    console.info(`Attempting to hide exam: ${examName}`);
    if (!fs.existsSync(currentUrl)) {
      throw new Error(`Exam not found: ${currentUrl}`);
    }

    fs.renameSync(currentUrl, newUrl);
    ExamBankController.refreshExamsList();
  }

  static async showExamFile(examName: string): Promise<void> {
    examName = examName.replace(".pdf", "").replace("-hidden", "");

    const currentUrl = `public/exams/${examName}-hidden.pdf`;
    const newUrl = currentUrl.replace("-hidden", "");

    console.info(`Attempting to unhide exam: ${examName}`);
    if (!fs.existsSync(currentUrl)) {
      throw new Error(`Exam not found: ${currentUrl}`);
    }

    fs.renameSync(currentUrl, newUrl);
    ExamBankController.refreshExamsList();
  }

  static async deleteExamFile(examName: string): Promise<void> {
    examName = examName.replace(".pdf", ""); // normalize

    const url = `public/exams/${examName}.pdf`;

    if (!fs.existsSync(url)) {
      throw new Error(`Exam not found: ${url}`);
    }

    fs.rmSync(url);
    ExamBankController.refreshExamsList();
  }

  /**
   * Re-creates the exam list JSON file based on the current
   * contents of the exams directory
   */
  static async refreshExamsList(): Promise<void> {
    const url = "_hidden/exams-list";

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
              this.logger.info("Exams file rewritten");
            } else {
              this.logger.warn(
                `Unexpected exams file rewrite result: ${statusCode}`
              );
            }
            break;
        }
      },
      await this.generateExamsList()
    );
  }

  static async uploadExams(exams: FileArray): Promise<void> {
    // single-exam uploads don't come as arrays
    if (!Array.isArray(exams.files)) {
      exams.files = [exams.files];
    }

    for (const exam of exams.files) {
      // validate naming
      const [department, courseCode, termNumber, ...type] =
        exam.name.split("-");

      if (!department || !courseCode || !termNumber || !type) {
        throw new Error("Ill-formed exam given");
      }

      // if the entire termNumber is not one integer
      if (parseInt(termNumber) + "" !== termNumber) {
        throw new Error("Bad term number given");
      }
    }

    for (const exam of exams.files) {
      await exam.mv(
        path.join(
          __dirname,
          `../../../public/exams/${exam.name.toLowerCase()}.pdf`
        )
      );
      console.info(`Exam file ${exam.name} uploaded`);
    }

    ExamBankController.refreshExamsList();
  }

  /**
   * Gets an array of every exam currently in the exam list folder
   */
  private static async generateExamsList(): Promise<Exam[]> {
    await this.validateTerms();

    const examFiles: Dirent[] = readdirSync("public/exams", {
      withFileTypes: true,
    });

    const unfilteredExams: {
      [key: string]: Exam;
    } = {};

    for (const file of examFiles) {
      const parts = file.name.split("-");
      const department = parts[0],
        course = parts[1],
        term = parts[2],
        type = parts.slice(3).join(" ").split(".")[0].replace(/ sol/i, ""); // strip file extension and solutions marker

      const isSolution = file.name.toLowerCase().includes("-sol");
      const dictionaryKey = [department, course, term, type].join("-");

      if (unfilteredExams[dictionaryKey]) {
        // If this exam is already in the dictionary, add this file (e.g. the exam) to it.
        if (isSolution) {
          unfilteredExams[dictionaryKey].solutionFile = file.name;
        } else {
          unfilteredExams[dictionaryKey].type = type;
          unfilteredExams[dictionaryKey].examFile = file.name;
        }

        console.info(`Adding ${file.name} to an existing exam.`);
      } else {
        // If this exam has no files read yet, add it to the dictionary with the file we have.
        unfilteredExams[dictionaryKey] = {
          department,
          courseCode: course,
          term,
          type,
          examFile: isSolution ? undefined : file.name,
          solutionFile: isSolution ? file.name : undefined,
          termName: TermNameController.getTermNameFromTermCode(term),
        };

        console.info(`Adding ${file.name} as a new exam.`);
      }
    }

    return Object.values(unfilteredExams).sort(this.sortExams);
  }

  /**
   * Sorts a list of exams, alphabetically by department,
   * course code, then chronologically, then by the test type where
   * midterms are prioritized
   */
  private static sortExams(a: Exam, b: Exam): number {
    if (a.department !== b.department) {
      return a.department < b.department ? -1 : 1;
    } else if (a.courseCode !== b.courseCode) {
      return a.courseCode < b.courseCode ? -1 : 1;
    } else if (a.term !== b.term) {
      return a.term < b.term ? 1 : -1; // sort by most recent
    } else {
      const midtermA = a.type.toLowerCase().includes("midterm");
      const midtermB = b.type.toLowerCase().includes("midterm");

      if ((midtermA && midtermB) || (!midtermA && !midtermB)) {
        return a.type < b.term ? -1 : 1;
      } else if (midtermA && !midtermB) {
        return -1;
      } else if (!midtermA && midtermB) {
        return 1;
      } else {
        throw new Error("Unreachable code reached");
      }
    }
  }

  private static async validateTerms() {
    const examFiles: Dirent[] = readdirSync("public/exams", {
      withFileTypes: true,
    });

    let valid = true;
    for (const exam of examFiles) {
      const parts = exam.name.split("-");
      const term = parts[2].padStart(4, "0");

      const isValidTerm = TermNameController.validateTerm(term);
      if (!isValidTerm) {
        valid = false;
        break;
      }
    }

    if (!valid) {
      await TermNameController.overwriteTermsFile();
    }
  }

  /**
   * Renames the type of an exam by renaming both the exam file and its solution file (if it exists)
   */
  static renameExamType(examName: string, newType: string): void {
    examName = examName.replace(".pdf", ""); // normalize like other methods

    const currentUrl = `public/exams/${examName}.pdf`;
    if (!fs.existsSync(currentUrl)) {
      throw new Error(`Exam not found: ${currentUrl}`);
    }

    const parts = examName.split("-");
    // Check if the last part is exactly "sol" per the invariant
    const isSolution = parts[parts.length - 1] === "sol";
    
    const newName = [
      parts[0],                    // department
      parts[1],                    // course
      parts[2],                    // term
      ...newType.split(" "),       // new type (split by spaces)
      ...(isSolution ? ["sol"] : []) // add solution marker if it was there
    ].join("-");

    const newUrl = `public/exams/${newName}.pdf`;
    
    try {
      console.info(`Attempting to rename exam: ${examName} to ${newName}`);
      fs.renameSync(currentUrl, newUrl);
      ExamBankController.refreshExamsList();
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error(`Exam not found: ${currentUrl}`);
      }
      throw new Error(`Failed to rename exam: ${error.message}`);
    }
  }
}
