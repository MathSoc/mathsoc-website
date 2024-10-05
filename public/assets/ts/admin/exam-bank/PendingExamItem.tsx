import React from "react";
import { ExamConfig } from "./AddExamsEditor";

export const PendingExamItem: React.FC<{
  file: File;
  updateExamConfig: (newConfig: Partial<ExamConfig>, filename: string) => void;
}> = ({ file, updateExamConfig }) => {
  const updateStringConfig = (
    target: HTMLInputElement,
    field: keyof ExamConfig,
    filename: string
  ) => {
    if (target.value === "") {
      target.classList.add("invalid");
    } else {
      target.classList.remove("invalid");
    }

    updateExamConfig({ [field]: target.value }, filename);
  };

  return (
    <li className="pending-exam-item">
      <span className="file-name">{file.name}</span>
      <div className="exam-data">
        <label>Department</label>
        <input
          placeholder="MATH"
          onChange={(e) =>
            updateStringConfig(e.target, "department", file.name)
          }
        ></input>
      </div>
      <div className="exam-data">
        <label>Course code</label>
        <input
          placeholder="135"
          onChange={(e) =>
            updateStringConfig(e.target, "courseCode", file.name)
          }
        ></input>
      </div>
      <div className="exam-data">
        <label>Term number</label>
        <input
          placeholder="1235"
          onChange={(e) =>
            updateStringConfig(e.target, "termNumber", file.name)
          }
        ></input>
      </div>
      <div className="exam-data">
        <label>Exam type</label>
        <input
          placeholder="Midterm"
          onChange={(e) => updateStringConfig(e.target, "examType", file.name)}
        ></input>
      </div>
      <div className="exam-data">
        <label>Is solution?</label>
        <input
          type="checkbox"
          onChange={(e) =>
            updateExamConfig({ isSolution: e.target.checked }, file.name)
          }
        ></input>
      </div>
    </li>
  );
};
