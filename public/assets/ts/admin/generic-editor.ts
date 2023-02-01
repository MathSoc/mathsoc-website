class GenericEditorPage {
  static init() {
    const editor = document.getElementById("jsoneditor");
    if (editor) {
      new Editor(editor, editor.getAttribute("data-source") as string);
    }

    this.addNavigationListeners();
  }

  static addNavigationListeners() {
    const dropdowns = Array.from(
      document.getElementById("editor-nav-menu").querySelectorAll(".dropdown")
    );

    for (const dropdown of dropdowns) {
      dropdown.querySelector('.dropdown-name').addEventListener("click", () => {
        const parent = dropdown.parentElement;

        if (dropdown.classList.contains("active")) {
          dropdown.classList.remove("active");
          return;
        } else {
          for (const child of Array.from(parent.children)) {
            if (child.classList.contains("dropdown")) {
              child.classList.remove("active");
            }
          }

          dropdown.classList.toggle("active");
        }
      });
    }
  }
}

GenericEditorPage.init();
