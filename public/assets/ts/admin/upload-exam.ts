import { showToast } from "./toast";

interface UploadFormData {
  department: string;
  courseCode: string;
  offeringTerm: string;
  offeringYear: number;
  type: string;
  examFile: File | null;
  solutionFile: File | null;
}

class UploadExamBankFrontend {
  constructor() {
    const uploadBtn = document.getElementById("upload-btn");
    uploadBtn.onclick = this.submitForm.bind(this);
    this.populateOfferingYear();
  }

  private async submitForm() {
    const formValues = this.getForm();
    const validated = this.validateForm(formValues);

    if (validated) {
      const formData = new FormData();
      Object.keys(formValues).forEach((key) =>
        formData.append(key, formValues[key])
      );

      const response = await fetch("/api/exams/upload", {
        method: "POST",
        body: formData,
      });
      await response.json();
      showToast("Exam uploaded successfully.", "success");
    }

    return validated;
  }

  private getForm(): UploadFormData {
    const courseName = document.getElementsByName(
      "course-name"
    )[0] as HTMLInputElement;
    const courseCode = document.getElementsByName(
      "course-code"
    )[0] as HTMLInputElement;
    const offeringTermSelect = document.getElementsByName(
      "offering-term-select"
    )[0] as HTMLSelectElement;
    const offeringYearSelect = document.getElementsByName(
      "offering-year-select"
    )[0] as HTMLSelectElement;
    const examTypeSelect = document.getElementsByName(
      "exam-type"
    )[0] as HTMLSelectElement;
    const examFile = document.getElementsByName(
      "exam-file"
    )[0] as HTMLInputElement;
    const solutionFile = document.getElementsByName(
      "solution-file"
    )[0] as HTMLInputElement;

    const formData: UploadFormData = {
      department: courseName.value,
      courseCode: courseCode.value,
      offeringTerm: offeringTermSelect.value,
      offeringYear: Number(offeringYearSelect.value),
      type: examTypeSelect.value,
      examFile: examFile.files?.length ? examFile.files.item(0) : null,
      solutionFile: solutionFile.files?.length
        ? solutionFile.files.item(0)
        : null,
    };
    return formData;
  }

  private validateForm(formData: UploadFormData): boolean {
    const errors = [];
    const {
      department,
      courseCode,
      offeringTerm,
      offeringYear,
      examFile,
      solutionFile,
    } = formData;
    if (department.trim() == "") {
      errors.push("Course name cannot be empty.");
    }
    if (courseCode.trim() == "") {
      errors.push("Course code cannot be empty.");
    } else {
      if (courseCode.trim().length != 3) {
        errors.push("Course code must be a 3 digit number.");
      }
    }
    if (!offeringTerm) {
      errors.push("Offering term cannot be empty");
    }
    if (Number.isNaN(offeringYear)) {
      errors.push("Offering year cannot be empty");
    }
    if (!examFile && !solutionFile) {
      errors.push(
        "You must provide atleast one of the exam file or the solution file."
      );
    }

    if (errors.length) {
      showToast(errors, "fail");
      return false;
    } else {
      return true;
    }
  }

  private populateOfferingYear() {
    const offeringYearSelect = document.getElementsByName(
      "offering-year-select"
    )[0] as HTMLSelectElement;

    const years: number[] = [];
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year > currentYear - 50; year--) {
      years.push(year);
    }

    years.map((item) => {
      const el = document.createElement("option");
      el.value = item.toString();
      el.text = item.toString();
      offeringYearSelect.appendChild(el);
    });
  }
}

new UploadExamBankFrontend();
