import { UploadedFile } from "express-fileupload";

export type Exam = {
  department: string;
  courseCode: string;
  term: string;
  type: string;
  examFile?: string;
  solutionFile?: string;
  termName?: string;
};

export type ExamWithFiles = Exam & {
  examFileObject?: UploadedFile;
  solutionFileObject?: UploadedFile;
};

export type Term = {
  termCode: string;
  name: string;
  nameShort: string;
  termBeginDate: string;
  termEndDate: string;
  sixtyPercentCompleteDate: string;
  associatedAcademicYear: string;
};
