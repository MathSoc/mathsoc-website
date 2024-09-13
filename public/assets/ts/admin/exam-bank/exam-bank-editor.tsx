import { createRoot } from "react-dom/client";
import { AddExamsEditor } from "./AddExamsEditor";
import React from "react";

class ExamBankEditor {
  static init() {
    const container = document.getElementById("add-exams-container");

    const root = createRoot(container);
    root.render(<AddExamsEditor />);
  }
}

ExamBankEditor.init();
