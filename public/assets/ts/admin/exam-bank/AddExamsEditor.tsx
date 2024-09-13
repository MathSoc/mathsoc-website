import React, { useCallback, useRef, useState } from "react";
import { PendingExamItem } from "./PendingExamItem";

export interface ExamConfig {
  department: string;
  courseCode: string;
  termNumber: string;
  fileType: string;
  isSolution: boolean;
}

type PendingExam = ExamConfig & {
  file: File;
};

export const AddExamsEditor: React.FC = () => {
  const [examFiles, setExamFiles] = useState<PendingExam[]>([]);
  const inputElement = useRef<HTMLInputElement>(null);

  const updateExamConfig = useCallback(
    (newConfig: Partial<ExamConfig>, filename: string) => {
      const file = examFiles.find((f) => f.file.name === filename);
      file.department = newConfig.department || file.department;
      file.courseCode = newConfig.courseCode || file.courseCode;
      file.termNumber = newConfig.termNumber || file.termNumber;
      file.fileType = newConfig.fileType || file.fileType;
      file.isSolution = newConfig.isSolution ?? file.isSolution;
    },
    [examFiles]
  );

  const updateFiles = () => {
    if (inputElement.current?.files) {
      setExamFiles(
        Array.from(inputElement.current.files).map((file) => ({
          file,
          department: "",
          courseCode: "",
          termNumber: "",
          fileType: "",
          isSolution: false,
        }))
      );
    }
  };

  const uploadExams = () => {
    console.log(examFiles);

    for (const exam of examFiles) {
      if (
        exam.department === "" ||
        exam.courseCode === "" ||
        exam.termNumber === "" ||
        exam.fileType === ""
      ) {
        alert(`Please fill out all fields for ${exam.file.name}`);
        return;
      }

      if (isNaN(parseInt(exam.termNumber)) || parseInt(exam.termNumber) < 0) {
        alert(
          `Term number must be a non-negative integer for ${exam.file.name}`
        );
        return;
      }
    }
  };

  return (
    <div id="add-exams-editor">
      <ul id="pending-exams-list">
        {examFiles.map((file) => {
          return (
            <PendingExamItem
              key={file.file.name}
              file={file.file}
              updateExamConfig={updateExamConfig}
            />
          );
        })}
      </ul>
      <div className="buttons">
        <button
          id="add-exams-button"
          onClick={() => inputElement.current?.click()}
        >
          Add exams
        </button>
        <button id="upload-exams-button" onClick={uploadExams}>
          Upload exams
        </button>
      </div>
      <input
        id="hidden-exam-upload"
        type="file"
        accept="application/pdf"
        multiple
        onChange={updateFiles}
        ref={inputElement}
      />
    </div>
  );
};
