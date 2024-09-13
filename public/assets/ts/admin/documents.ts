import { showToast } from "./toast";

// @todo use a single source of the DocumentType type for frontend and backend
// i don't think this can be done because of the document interface on the DOM
type Document = {
  fileName: string;
  fileType: string;
  path: string;
  publicLink: string;
};

class DocumentUploader {
  static getUploadButton(): HTMLInputElement {
    return document.getElementById("upload-btn") as HTMLInputElement;
  }

  static getInputFiles(): FileList {
    const fileInput = document.getElementsByName(
      "documents"
    )[0] as HTMLInputElement;
    return fileInput.files;
  }

  static init() {
    this.populateDocuments();
    DocumentUploader.getUploadButton().addEventListener("click", () =>
      DocumentUploader.submitDocuments()
    );
  }

  static getDocumentContainer(): HTMLDivElement {
    return document.querySelector("#document-list") as HTMLDivElement;
  }

  private static resetDocumentContainer() {
    const container = this.getDocumentContainer();
    if (container.children) {
      Array.from(container.children).forEach((child) => {
        container.removeChild(child);
      });
    }
  }

  static async submitDocuments() {
    const files = this.getInputFiles();

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

    await this.populateDocuments();
  }

  private static async getDocuments() {
    const documents: Document[] = await fetch("/api/documents").then((res) =>
      res.json()
    );

    return documents;
  }

  private static async populateDocuments() {
    const documentContainer = this.getDocumentContainer();
    const documents = await this.getDocuments();
    this.resetDocumentContainer();

    for (const doc of documents) {
      const newButton = this.createDocumentButton(doc);
      documentContainer.appendChild(newButton);
    }
  }

  private static createDocumentButton(doc: Document): HTMLElement {
    const newButton = document.createElement("button");
    newButton.innerText = doc.fileName;
    newButton.onclick = () => {
      location.href = doc.publicLink;
    };
    newButton.classList.add("document-button");

    const newDiv = document.createElement("div");
    newDiv.style.display = "flex";
    const deleteButton = document.createElement("button");
    deleteButton.onclick = () => this.deleteDocument(doc);
    deleteButton.classList.add("delete-button");
    deleteButton.innerText = "Delete";
    const copyLinkButton = document.createElement("button");
    copyLinkButton.onclick = () =>
      this.copyLinkToClipboard(doc.publicLink, doc.fileName);
    copyLinkButton.classList.add("copy-button");
    copyLinkButton.innerText = "Copy Link";
    newDiv.appendChild(newButton);
    newDiv.appendChild(deleteButton);
    newDiv.appendChild(copyLinkButton);

    return newDiv;
  }

  private static async deleteDocument(doc: Document) {
    const options = {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(doc),
    };

    const response = await fetch("/api/document/delete", options).then((res) =>
      res.json()
    );

    if (response.status == "success") {
      this.populateDocuments();
    } else {
      showToast("Unknown error. Could not delete document", "fail");
      return;
    }
  }

  private static copyLinkToClipboard(link: string, fileName: string) {
    navigator.clipboard.writeText(link);
    showToast(
      `Link for ${fileName} was copied to clipboard as ${link}`,
      "success"
    );
  }
}

DocumentUploader.init();
