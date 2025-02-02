import { Exam } from "../../../server/types/exam-bank.js";
import { showToast } from "./admin/toast.js";

interface ExamTypeRenameResponse {
  success: boolean;
  error?: string;
}

class ExamBankFrontend {
  static readonly isInAdmin = window.location.href
    .split("?")[0]
    .includes("/admin/");

  static getExamList(): HTMLTableElement {
    return document.getElementById("exams-table") as HTMLTableElement;
  }

  static init() {
    ExamBankFrontend.populateTable();
    (<HTMLInputElement>(
      document.getElementById("exam-list-filter")
    )).addEventListener("input", ExamBankFrontend.filtersInputEventListener);
  }

  static async filtersInputEventListener(this: HTMLInputElement) {
    ExamBankFrontend.applyFiltersToTable(this.value);
  }

  /**
   * Applies the given filters to the exam list table
   */
  static applyFiltersToTable(filters: string) {
    const searchTokens = filters.split(" ");
    const table = this.getExamList();

    // parse which words filter which column
    const courseCodeSearchTokens: string[] = [];
    const courseDeptSearchTokens: string[] = [];

    for (const token of searchTokens) {
      if (token.match(/[0-9]/)) {
        courseCodeSearchTokens.push(token);
      } else {
        courseDeptSearchTokens.push(token);
      }
    }

    if (filters.trim().length === 0) {
      table.classList.remove("filtered-code");
      table.classList.remove("filtered-dept");
    } else {
      if (courseCodeSearchTokens.length > 0) {
        table.classList.add("filtered-code");
      } else {
        table.classList.remove("filtered-code");
      }
      if (courseDeptSearchTokens.length > 0) {
        table.classList.add("filtered-dept");
      } else {
        table.classList.remove("filtered-dept");
      }
    }

    // apply filters
    const examRows = Array.from(
      table.querySelectorAll("tbody tr")
    ) as HTMLTableRowElement[];

    for (const examRow of examRows) {
      const compareToken = (
        tokenFromRow: string,
        filterTokens: string[],
        matchClass: string
      ) => {
        const departmentTokensMatchExam: boolean = filterTokens
          .filter((token) => token.length > 0)
          .reduce((foundAPreviousToken: boolean, currentToken: string) => {
            return (
              foundAPreviousToken ||
              tokenFromRow.includes(currentToken.toLowerCase())
            );
          }, false);

        if (departmentTokensMatchExam) {
          examRow.classList.add(matchClass);
        } else {
          examRow.classList.remove(matchClass);
        }
      };

      const examDepartment = examRow.getAttribute("data-course-dept");
      compareToken(
        examDepartment.toLowerCase(),
        courseDeptSearchTokens,
        "dept-match"
      );

      const examCourseCode = examRow.getAttribute("data-course-code");
      compareToken(
        examCourseCode.toLowerCase(),
        courseCodeSearchTokens,
        "code-match"
      );
    }
  }

  /**
   * Builds the exam bank table
   */
  static async populateTable() {
    const exams: Exam[] = await fetch("/api/exams").then((response) =>
      response.json()
    );

    const tableBody = this.getExamList().querySelector("tbody");
    const hiddenRow = tableBody.querySelector("#hidden-row");

    for (const exam of exams) {
      const newRow = hiddenRow.cloneNode(true) as HTMLElement;
      newRow.id = "";
      newRow.innerHTML = newRow.innerHTML
        .replace(
          "$COURSE-NAME$",
          `${exam.department.toUpperCase()} ${exam.courseCode}`
        )
        .replace("$COURSE-DEPT$", exam.department)
        .replace("$COURSE-CODE$", exam.courseCode)
        .replace("$OFFERING$", exam.termName)
        .replace("$TYPE$", exam.type.toLowerCase().replace("hidden", ""))
        .replace("$EXAM-FILE$", `/exams/${exam.examFile}`)
        .replace("$SOLUTION-FILE$", `/exams/${exam.solutionFile}`);

      newRow.setAttribute("data-course-dept", exam.department);
      newRow.setAttribute("data-course-code", exam.courseCode);

      const examHidden = exam.examFile?.toLowerCase().includes("-hidden");
      const solutionHidden = exam.solutionFile
        ?.toLowerCase()
        .includes("-hidden");

      if (exam.examFile && (this.isInAdmin || !examHidden)) {
        newRow.querySelector(".exam-download").classList.add("active");
      }
      if (exam.solutionFile && (this.isInAdmin || !solutionHidden)) {
        newRow.querySelector(".solution-download").classList.add("active");
      }

      // exam actions: hide and delete
      if (this.isInAdmin) {
        if (examHidden) {
          newRow.querySelector(".exam-hide-icon").classList.add("active");
        }
        if (solutionHidden) {
          newRow.querySelector(".solution-hide-icon").classList.add("active");
        }

        ExamBankFrontend.populateExamActions(
          newRow,
          "exam",
          exam.examFile,
          exam
        );
        ExamBankFrontend.populateExamActions(
          newRow,
          "solution",
          exam.solutionFile,
          exam
        );
      }

      if (
        this.isInAdmin ||
        (exam.examFile && !examHidden) ||
        (exam.solutionFile && !solutionHidden)
      ) {
        tableBody.appendChild(newRow);
      }
    }
  }

  /**
   * Handles the renaming of an exam type
   * @param exam - The exam to rename
   * @param currentType - The current type of the exam
   * @returns Promise resolving to the rename operation result
   */
  private static async handleExamTypeRename(
    exam: Exam, 
    currentType: string
  ): Promise<ExamTypeRenameResponse> {
    const newType = prompt(`Enter new type for ${exam.department.toUpperCase()} ${exam.courseCode} (current: ${currentType})`);
    
    if (!newType || newType.trim() === currentType) {
      return { success: false };
    }

    try {
      const response = await fetch(`/api/admin/exams/${exam.examFile.replace(".pdf", "")}/rename-type`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ newType: newType.trim() }),
      });

      if (!response.ok) {
        throw new Error(`Failed to rename exam type: ${response.statusText}`);
      }

      await this.populateTable();
      
      return { success: true };
    } catch (error) {
      console.error("Error renaming exam type:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error occurred" 
      };
    }
  }

  static async populateExamActions(
    row: HTMLElement,
    type: "exam" | "solution",
    file: string,
    exam: Exam
  ) {
    if (!file) {
      row.querySelector(`.${type}-actions`).classList.add("hidden");
      return;
    }

    // Add type renaming for admin users (only for exam, not solution)
    if (this.isInAdmin && type === "exam") {
      const typeCell = row.querySelector(".exam-type") as HTMLTableCellElement;
      if (typeCell) {
        typeCell.style.cursor = "pointer";
        typeCell.title = "Click to rename exam type";
        typeCell.addEventListener("click", async () => {
          const result = await this.handleExamTypeRename(exam, exam.type);
          if (result.success) {
            showToast("Exam type updated successfully", "success");
          } else if (result.error) {
            showToast(result.error, "fail");
          }
        });
      }
    }

    row.querySelector(`.${type}-hide-icon`).addEventListener("click", () => {
      if (
        row.querySelector(`.${type}-hide-icon`).classList.contains("active")
      ) {
        fetch(`/api/exams/${file.replace(".pdf", "")}/show`, {
          method: "POST",
        });
        row.querySelector(`.${type}-hide-icon`).classList.remove("active");
      } else {
        fetch(`/api/exams/${file.replace(".pdf", "")}/hide`, {
          method: "POST",
        });
        row.querySelector(`.${type}-hide-icon`).classList.add("active");
      }
    });

    row.querySelector(`.${type}-delete-icon`).addEventListener("click", () => {
      const confirmed = confirm(
        `Are you sure you want to delete ${exam.department.toUpperCase()} ${
          exam.courseCode
        } - ${exam.type.toUpperCase()}?`
      );

      if (confirmed) {
        fetch(`/api/exams/${file.replace(".pdf", "")}/delete`, {
          method: "DELETE",
        }).then(() => {
          row.style.display = "none";
        });
      }
    });
  }
}

ExamBankFrontend.init();
