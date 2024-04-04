
import { createRoot } from "react-dom/client";
import React from "react";
import { EditorV2 } from "./page-editor/EditorV2";

class GenericEditorPage {
  static init() {
    const editor = document.getElementById("jsoneditor");
    const root = createRoot(editor);
    root.render(<EditorV2 source={editor?.getAttribute("data-source")} />);

    this.addNavigationListeners();
  }

  static addNavigationListeners() {
    const dropdowns = Array.from(
      document
        .getElementById("editor-nav-menu")
        ?.querySelectorAll(".dropdown") ?? []
    );

    for (const dropdown of dropdowns) {
      dropdown
        .querySelector(".dropdown-name")
        ?.addEventListener("click", () => {
          const parent = dropdown.parentElement;

          if (dropdown.classList.contains("active")) {
            dropdown.classList.remove("active");
            return;
          } else {
            for (const child of Array.from(parent?.children ?? [])) {
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
