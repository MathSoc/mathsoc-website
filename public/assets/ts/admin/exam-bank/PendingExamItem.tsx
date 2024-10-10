import React, { useEffect, useState } from "react";
import { ExamConfig } from "./AddExamsEditor";

export const PendingExamItem: React.FC<{
  file: File;
  updateExamConfig: (newConfig: Partial<ExamConfig>, filename: string) => void;
}> = ({ file, updateExamConfig }) => {
  const [fileDepartment, fileCode, fileTerm, ...fileExamNameParts] =
    file.name.split(/[.-]/);
  const fileExamName = fileExamNameParts
    .filter((p) => p.toLowerCase() !== "sol" && p.toLowerCase() !== "pdf")
    .join(" ");
  const fileNameIndicatesIsSolution = fileExamNameParts
    .map((p) => p.toLowerCase())
    .includes("sol");
  // handle solns

  const [department, setDepartment] = useState<string>(fileDepartment ?? "");
  const [courseCode, setCourseCode] = useState<string>(fileCode ?? "");
  const [termNumber, setTermNumber] = useState<string>(fileTerm ?? "");
  const [examType, setExamType] = useState<string>(fileExamName ?? "");
  const [isSolution, setIsSolution] = useState<boolean>(
    fileNameIndicatesIsSolution ?? false
  );

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

  // set all fields to defaults
  useEffect(() => {
    updateExamConfig(
      {
        department: department,
        courseCode: courseCode,
        termNumber: termNumber,
        examType: examType.replace(" ", "-"),
        isSolution: isSolution,
      },
      file.name
    );
  });

  return (
    <li className="pending-exam-item">
      <span className="file-name">{file.name}</span>
      <div className="exam-data">
        <label>Department</label>
        <input
          value={department}
          placeholder="MATH"
          onChange={(e) => {
            setDepartment(e.target.value);
            updateStringConfig(e.target, "department", file.name);
          }}
        ></input>
      </div>
      <div className="exam-data">
        <label>Course code</label>
        <input
          value={courseCode}
          placeholder="135"
          onChange={(e) => {
            setCourseCode(e.target.value);
            updateStringConfig(e.target, "courseCode", file.name);
          }}
        ></input>
      </div>
      <div className="exam-data">
        <label>Term number</label>
        <input
          value={termNumber}
          placeholder="1235"
          onChange={(e) => {
            setTermNumber(e.target.value);
            updateStringConfig(e.target, "termNumber", file.name);
          }}
        ></input>
      </div>
      <div className="exam-data">
        <label>Exam type</label>
        <input
          value={examType}
          placeholder="Midterm"
          onChange={(e) => {
            setExamType(e.target.value);
            updateStringConfig(e.target, "examType", file.name);
          }}
        ></input>
      </div>
      <div className="exam-data">
        <label>Is solution?</label>
        <input
          checked={isSolution}
          type="checkbox"
          onChange={(e) => {
            setIsSolution(e.target.checked);
            updateExamConfig({ isSolution: e.target.checked }, file.name);
          }}
        ></input>
      </div>
      <div className="exam-data">
        <label>Remove from Upload?</label>
        <button className="delete-btn" onClick={() => console.log("Delete ME")}>
          X
        </button>
      </div>
    </li>
  );
};
