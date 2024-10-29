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
  keyStr: string;
};

export const AddExamsEditor: React.FC = () => {
  const [examFiles, setExamFiles] = useState<PendingExam[]>([]);
  const inputElement = useRef<HTMLInputElement>(null);

  const [keyGen, setKeyGen] = useState<number>(0);

  const updateExamConfig = useCallback(
    (newConfig: Partial<ExamConfig>, fileKey: string) => {
      const file = examFiles.find((f) => f.keyStr === fileKey);
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
        examFiles.concat(
          Array.from(inputElement.current.files).map((file) => ({
            file,
            keyStr: `${file.name}${(setKeyGen(keyGen + 1), keyGen)}`,
            department: "",
            courseCode: "",
            termNumber: "",
            examType: "",
            isSolution: false,
          }))
        )
      );
    }
  };

  const uploadExams = async () => {
    // validate
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
      const renamedName = `${exam.department}-${exam.courseCode}-${
        exam.termNumber
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

  const deleteFile = (fileKey: string) => {
    setExamFiles(examFiles.filter((file) => file.keyStr !== fileKey));
  };

  return (
    <div id="add-exams-editor">
      <ul id="pending-exams-list">
        {examFiles.map((file) => {
          return (
            <PendingExamItem
              key={file.keyStr}
              keyStr={file.keyStr}
              file={file.file}
              updateExamConfig={updateExamConfig}
              removeExam={() => deleteFile(file.keyStr)}
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
        onClick={() => (inputElement.current.value = "")}
        ref={inputElement}
      />
    </div>
  );
};
