import React, { useCallback, useRef, useState } from "react";
import { PendingExamItem } from "./PendingExamItem";
import { showToast } from "../toast";

export interface ExamConfig {
  department: string;
  courseCode: string;
  termNumber: string;
  examType: string;
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
      file.examType = newConfig.examType || file.examType;
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
          examType: "",
          isSolution: false,
        }))
      );
    }
  };

  const uploadExams = async () => {
    if (examFiles.length == 0) {
      alert('No files were uploaded.')
      return;
    }

    for (const exam of examFiles) {
      if (
        exam.department === "" ||
        exam.courseCode === "" ||
        exam.termNumber === "" ||
        exam.examType === ""
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

    const formData: FormData = new FormData();
    for (const exam of examFiles) {
      const renamedName = `${exam.department}-${exam.courseCode}-${exam.termNumber
        }-${exam.examType}${exam.isSolution ? "-sol" : ""}`;

      formData.append("files", exam.file, renamedName);
    }

    const options = {
      method: "POST",
      body: formData,
    };

    const response = await fetch("/api/exams/upload", options);
    const parsedResponse = await response.json();
    if (parsedResponse.errors?.length) {
      alert(parsedResponse.errors.join(", "));
    } else {
      showToast("Upload successful. Refresh page to see new exams.", "success");
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
          Add exams for upload
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
