import { createRoot } from "react-dom/client";
import React from "react";
import { EditorPageV2 } from "./page-editor/EditorPageV2";

class GenericEditorPage {
  static init() {
    const editor = document.getElementById("jsoneditor");
    const root = createRoot(editor);
    root.render(
      <EditorPageV2
        source={editor?.getAttribute("data-source")}
        name={editor?.getAttribute("data-name")}
      />
    );
  }
}

GenericEditorPage.init();
