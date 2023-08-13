import { Dirent, readdirSync, existsSync, renameSync } from "fs";
import { Exam, ExamWithFiles } from "../../types/exam-bank";
import { TermNameController } from "./term-name-controller";
import { Request, Response } from "express";
import { AbstractFileController } from "./util/file-controller";
import { UploadedFile } from "express-fileupload";

interface UploadExamBody {
  department: string;
  courseCode: string;
  offeringTerm: string;
  offeringYear: string;
  type: string;
}

type ExamUploadRequest = {
  exam: ExamWithFiles;
  errors: string[];
  res: Response;
};

// TODO: figure out how to delete exams / solutions
type ExamDeleteRequest = {
  fileName: string;
  path: string;
  res: Response;
};

export class ExamBankController extends AbstractFileController<
  Exam,
  ExamUploadRequest,
  ExamDeleteRequest
> {
  constructor() {
    const dataUrl = "_hidden/exams-list";
    const publicLink = "/exams";
    const publicPath = "public/exams";

    super(publicPath, publicLink, dataUrl);
  }

  uploadFiles(req: Request, res: Response): void {
    try {
      const examFile: UploadedFile | undefined = req.files?.examFile as
        | UploadedFile
        | undefined;
      const solutionFile: UploadedFile | undefined = req.files?.solutionFile as
        | UploadedFile
        | undefined;

      const {
        department,
        courseCode,
        offeringTerm,
        offeringYear,
        type,
      }: UploadExamBody = req.body;

      const termCode = TermNameController.getTermCodeFromTermAndYear(
        offeringTerm,
        Number(offeringYear)
      );

      const examWithFiles: ExamWithFiles = {
        department,
        courseCode,
        term: termCode.toString(),
        type,
        examFile: examFile ? this.examFileName(false, req.body) : undefined,
        solutionFile: solutionFile
          ? this.examFileName(true, req.body)
          : undefined,
        examFileObject: examFile,
        solutionFileObject: solutionFile,
      };

      // add to upload queue
      this.uploadQueue.push({
        exam: examWithFiles,
        errors: [],
        res,
      });
    } catch (err) {
      this.logger.error(err.message);
      res.send(400).redirect("/admin/upload-exam");
    }
  }

  deleteFile(req: Request, res: Response): void {
    try {
      const { fileName }: { fileName: string } = req.body;

      if (!fileName) {
        throw new Error("File name not provided with delete request");
      }

      const fullPath = `public/exams/${fileName}`;
      if (!existsSync(fullPath)) {
        throw new Error("File provdided does not exist.");
      }

      const deleteRequest: ExamDeleteRequest = {
        fileName,
        path: fullPath,
        res,
      };

      this.deleteQueue.push(deleteRequest);
    } catch (err) {
      this.logger.error(err.message);
      res.status(400).send(err.message);
    }
  }

  async processFileUpload(request: ExamUploadRequest): Promise<void> {
    const { exam, res } = request;

    try {
      if (exam.examFile && exam.examFileObject) {
        const examFilePath = this.getFilePath(exam.examFile);
        await exam.examFileObject.mv(examFilePath);
        this.logger.info(`${exam.examFile} uploaded to ${examFilePath}`);
      }

      if (exam.solutionFile && exam.solutionFileObject) {
        const solutionFilePath = this.getFilePath(exam.solutionFile);
        await exam.solutionFileObject.mv(solutionFilePath);
        this.logger.info(
          `${exam.solutionFile} uploaded to ${solutionFilePath}`
        );
      }
    } catch (err) {
      this.logger.error(err);
    }

    await this.rewriteFileJson();

    res.send({ status: "success", errors: [] });
  }

  async hideExamFile(examName: string): Promise<void> {
    const currentUrl = `public/exams/${examName}.pdf`;
    const newUrl = `public/exams/${examName}-hidden.pdf`;

    if (!existsSync(currentUrl)) {
      throw new Error("Exam not found");
    }

    renameSync(currentUrl, newUrl);
    await this.rewriteFileJson();
  }

  async showExamFile(examName: string): Promise<void> {
    const currentUrl = `public/exams/${examName}.pdf`;
    const newUrl = currentUrl.replace("-hidden", "");

    if (!existsSync(currentUrl)) {
      throw new Error("Exam not found");
    }

    renameSync(currentUrl, newUrl);
    await this.rewriteFileJson();
  }
  /**
   * Gets an array of every exam currently in the exam list folder
   */
  async generateJson(): Promise<Exam[]> {
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
        type = parts.slice(3).join(" ").split(".")[0].replace(" sol", ""); // strip file extension and solutions marker

      const isSolution = file.name.includes("-sol");
      const dictionaryKey = [department, course, term].join("-");

      if (unfilteredExams[dictionaryKey]) {
        // If this exam is already in the dictionary, add this file (e.g. the exam) to it.
        if (isSolution) {
          unfilteredExams[dictionaryKey].solutionFile = file.name;
        } else {
          unfilteredExams[dictionaryKey].type = type;
          unfilteredExams[dictionaryKey].examFile = file.name;
        }
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
      }
    }

    return Object.values(unfilteredExams).sort(this.sortExams);
  }

  /**
   * Sorts a list of exams, alphabetically by department,
   * course code, then chronologically, then by the test type where
   * midterms are prioritized
   */
  private sortExams(a: Exam, b: Exam): number {
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

  private async validateTerms() {
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

  private examFileName(isSolutionFile: boolean, exam: UploadExamBody): string {
    const term = TermNameController.getTermCodeFromTermAndYear(
      exam.offeringTerm,
      Number(exam.offeringYear)
    );

    let str = `${exam.department.toUpperCase()}-${exam.courseCode}-${term}-${
      exam.type
    }`;
    if (isSolutionFile) {
      str += "-sol";
    }

    str += ".pdf";

    return str;
  }
}
