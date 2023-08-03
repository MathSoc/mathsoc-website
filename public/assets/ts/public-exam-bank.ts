import { Exam } from "../../../server/types/exam-bank.js";

class ExamBankFrontend {
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
        .replace("$COURSE-NAME$", `${exam.department} ${exam.courseCode}`)
        .replace("$COURSE-DEPT$", exam.department)
        .replace("$COURSE-CODE$", exam.courseCode)
        .replace("$OFFERING$", exam.termName)
        .replace("$TYPE$", exam.type.replace("hidden", ""))
        .replace("$EXAM-FILE$", `/exams/${exam.examFile}`)
        .replace("$SOLUTION-FILE$", `/exams/${exam.solutionFile}`);

      newRow.setAttribute("data-course-dept", exam.department);
      newRow.setAttribute("data-course-code", exam.courseCode);

      if (exam.examFile && !exam.examFile.includes("-hidden")) {
        newRow.querySelector(".exam-download").classList.add("active");
      }
      if (exam.solutionFile && !exam.solutionFile.includes("-hidden")) {
        newRow.querySelector(".solution-download").classList.add("active");
      }

      // check if both exam and solution exist AND if they are both empty
      if (
        exam.examFile &&
        exam.examFile.includes("-hidden") &&
        exam.solutionFile &&
        exam.solutionFile.includes("-hidden")
      ) {
        continue;
        // check if only exam file exists and it is hidden
      } else if (
        exam.examFile &&
        exam.examFile.includes("-hidden") &&
        !exam.solutionFile
      ) {
        continue;
        // check if only solution file exists and it is hidden
      } else if (
        exam.solutionFile &&
        exam.solutionFile.includes("-hidden") &&
        !exam.examFile
      ) {
        continue;
      }

      tableBody.appendChild(newRow);
    }
  }
}

ExamBankFrontend.init();
