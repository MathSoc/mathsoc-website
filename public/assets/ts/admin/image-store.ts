// @todo use a single source of the Image type for frontend and backend
type Image = {
  fileName: string;
  path: string;
  publicLink: string;
  fileType: string;
};

class ImageStoreFrontend {
  static init() {
    this.populateImages();
    (<HTMLInputElement>(
      document.getElementsByName("image-search-input")[0]
    )).addEventListener("input", ImageStoreFrontend.filterImages);
  }

  static filterImages(this: HTMLInputElement) {
    ImageStoreFrontend.applySearchFilter(this.value);
  }

  static getImageContainer(): HTMLDivElement {
    return document.querySelector(".images") as HTMLDivElement;
  }
  private static async getImages() {
    const images: Image[] = await fetch("/api/images").then((res) =>
      res.json()
    );

    return images;
  }

  private static createImageCard(img: Image): HTMLElement {
    const hiddenImage = this.getImageContainer().querySelector("#hidden-image");
    const newImageCard = hiddenImage.cloneNode(true) as HTMLElement;

    newImageCard.id = "";
    newImageCard.setAttribute("data-filename", img.fileName);
    newImageCard.classList.add("image-card");
    newImageCard.querySelector("img").setAttribute("src", img.publicLink);
    newImageCard.querySelector("img").setAttribute("height", "150");
    newImageCard.querySelector("img").setAttribute("width", "auto");

    const deleteButton = newImageCard.querySelector(
      ".img-delete"
    ) as HTMLButtonElement;
    const linkButton = newImageCard.querySelector(
      ".img-link-copy"
    ) as HTMLButtonElement;
    deleteButton.onclick = () => this.deleteImage(img);
    linkButton.onclick = () =>
      this.copyLinkToClipboard(img.publicLink, img.fileName);

    newImageCard.querySelector(".img-name").innerHTML = img.fileName;

    return newImageCard;
  }

  private static async populateImages() {
    const imageContainer = this.getImageContainer();
    const imageResponse = await this.getImages();
    const noImagesContainer = document.querySelector(
      ".no-images-message"
    ) as HTMLDivElement;

    if (imageResponse.length === 0) {
      noImagesContainer.style.display = "flex";
      imageContainer.style.display = "none";
    } else {
      imageContainer.style.display = "flex";
      noImagesContainer.style.display = "none";
    }

    for (const image of imageResponse) {
      const newImageCard = this.createImageCard(image);
      imageContainer.appendChild(newImageCard);
    }
  }

  private static async deleteImage(img: Image) {
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(img),
    };
    const response = await fetch("/api/image/delete", options).then((res) =>
      res.json()
    );
    if (response.status === "success") {
      location.reload();
    } else {
      if (response.message) {
        showToast("Cannot delete file that is in use.", "fail");
        return;
      }
    }
  }

  private static applySearchFilter(filter: string) {
    const imageContainer = this.getImageContainer();
    const children = imageContainer.childNodes;

    if (filter.trim() !== "") {
      children.forEach((child) => {
        const element = child as HTMLElement;
        const fileName = element.getAttribute("data-filename");
        if (!fileName.includes(filter)) {
          element.style.display = "none";
        } else {
          element.style.display = "block";
        }
      });
    } else {
      children.forEach((child) => {
        const element = child as HTMLElement;
        if (element.id !== "hidden-image") element.style.display = "block";
      });
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

ImageStoreFrontend.init();