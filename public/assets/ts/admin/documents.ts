import { showToast } from "./toast";
console.log('file');

class DocumentUploader {
  static getUploadButton(): HTMLInputElement {
    return document.getElementById("upload-btn") as HTMLInputElement;
  }

  static init() {
    DocumentUploader.getUploadButton().addEventListener("click", () =>
      DocumentUploader.submitDocuments()
    );
  }

  static async submitDocuments() {
    const files = DocumentUploader.getUploadButton().files;
    console.log(DocumentUploader.getUploadButton());
    console.log(files);

    if (!files?.length) {
      showToast(
        "No files were uploaded. Please try again after uploading a file.",
        "fail"
      );
      return;
    }

    const formData = new FormData();

    for (let file = 0; file < files.length; file++) {
      formData.append("documents", files.item(file));
    }

    const options = {
      method: "POST",
      body: formData,
    };

    const response = await fetch("/api/document/upload", options);
    const parsedResponse = await response.json();
    if (parsedResponse.errors.length) {
      showToast(parsedResponse.errors.join(", "), "fail");
    }
  }
}

DocumentUploader.init();
