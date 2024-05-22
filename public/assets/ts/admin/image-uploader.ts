import { showToast } from "./toast";

export class ImageUploader {
  static async uploadImages(files: FileList) {
    if (!files.length) {
      showToast(
        "No files were uploaded. Please try again after uploading a file.",
        "fail"
      );
      return;
    }

    const formData = new FormData();

    for (let file = 0; file < files.length; file++) {
      formData.append("images", files.item(file));
    }

    const options = {
      method: "POST",
      body: formData,
    };

    const response = await fetch("/api/image/upload", options);
    const parsedResponse = await response.json();
    if (parsedResponse.errors.length) {
      showToast(parsedResponse.errors.join(", "), "fail");
    }

    return parsedResponse.files;
  }
}
