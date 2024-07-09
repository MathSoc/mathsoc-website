class CartoonsArchive {
  static init() {
    const courseButtons: HTMLButtonElement[] = Array.from(
      document.querySelectorAll("button.course-button")
    );

    // register button listeners
    for (const button of courseButtons) {
      button.addEventListener("click", () => {
        CartoonsArchive.openModalForButton(button);
      });
    }

    // register close modal listeners
    document
      .getElementById("cartoon-display-bg")
      .addEventListener("click", CartoonsArchive.closeModal);
    document
      .getElementById("cartoon-display-modal") // prevent clicking the modal from closing it
      .addEventListener("click", (e: MouseEvent) => e.stopPropagation());
    document
      .getElementById("cartoons-modal-close-btn")
      .addEventListener("click", CartoonsArchive.closeModal);
  }

  private static closeModal() {
    document.getElementById("cartoon-display-bg").classList.remove("active");
  }

  /**
   * Handles opening the cartoon display modal when a cartoon button is clicked
   */
  private static openModalForButton(button: HTMLButtonElement) {
    const imageSources = button.getAttribute("data-img-srcs").split(";");
    const cartoonName = button.getAttribute("data-name");

    const modalBackground: HTMLElement =
      document.getElementById("cartoon-display-bg");
    const modalContent: HTMLElement = document.getElementById(
      "cartoon-modal-content"
    );
    const title = modalBackground.querySelector("h1");

    title.innerText = cartoonName;
    modalContent.innerHTML = "";

    for (const source of imageSources) {
      const image = document.createElement("img");
      image.src = source;
      image.alt = `Cartoon about ${cartoonName}`;
      modalContent.appendChild(image);
    }

    modalBackground.classList.add("active");
  }
}

CartoonsArchive.init();
