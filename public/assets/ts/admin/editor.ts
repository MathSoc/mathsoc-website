import { showToast } from "./toast";
import Quill from "quill";
import JSONEditor, { JSONEditorOptions } from "jsoneditor";

enum MarkdownFieldHighlightClasses {
  HOVERABLE = "hoverable-markdown-field",
  CLICKED = "highlighted-markdown-field",
}

type EditorNode = {
  field?: string;
  value?: string;
  path?: (string | number)[];
};

export class Editor {
  options: JSONEditorOptions;
  editor: JSONEditor;
  sourceDataURL: string;
  name: string;
  richTextEditor: Quill;

  private lastHighlightedMarkdownNode: EditorNode = null;
  private lastHighlightedMarkdownElement: HTMLElement = null;

  constructor(container: HTMLElement, sourceDataURL: string) {
    this.richTextEditor = new Quill("#quill-editor", {
      theme: "snow",
    });
    this.options = {
      onEditable: this.onEditorEditable,
      onEvent: this.onEditorEvent.bind(this),
    };

    this.sourceDataURL = sourceDataURL;
    this.editor = new JSONEditor(container, this.options);

    this.name = this.getFormattedURL(this.sourceDataURL.split("path=")[1]);
    this.attachButtonHandlers();

    (async () => {
      this.editor.set(await this.getFileData());
    })();
  }

  private getOpenEditorButton() {
    return document.getElementById("open-editor-btn") as HTMLButtonElement;
  }

  private getSaveEditorButton() {
    return document.getElementById("save-editor-btn") as HTMLButtonElement;
  }

  private getSaveRichEditorButton() {
    return document.getElementById("save-rich-text-btn") as HTMLButtonElement;
  }

  private getCancelRichTextEditorButton() {
    return document.getElementById("cancel-rich-text-btn") as HTMLButtonElement;
  }

  private attachButtonHandlers() {
    const openButton = this.getOpenEditorButton();
    const saveButton = this.getSaveEditorButton();
    const saveRichTextButton = this.getSaveRichEditorButton();

    const cancelRichTextButton = this.getCancelRichTextEditorButton();

    saveButton.querySelector(".editor-name").innerHTML = this.name;
    saveButton.onclick = () => this.saveData(this.sourceDataURL);
    saveRichTextButton.onclick = () => this.saveQuillMarkdownToEditor();
    openButton.onclick = () => this.openRichTextModal();
    cancelRichTextButton.onclick = () => this.closeRichTextModal();
  }

  // open the rich text modal
  private openRichTextModal() {
    const modal = document.getElementById("modal");
    modal.style.display = "block";
  }

  // close the rich text modal
  private closeRichTextModal() {
    const modal = document.getElementById("modal");
    modal.style.display = "none";
  }

  /*
  controls the rich text editor
  - enables the button once a markdown field is clicked
  - disables it otherwise
  - saves the new markdown into the data once the new markdown has been saved
  - saves and restores the expansion state of the json editor 
  */

  private onEditorEvent(node: EditorNode, event: Event) {
    // when a markdown field is hovered, add a class with a :hover selector to it
    if (
      event.type === "mouseover" &&
      node?.field?.includes("Markdown") &&
      event.target instanceof HTMLElement
    ) {
      event.target.classList.add(MarkdownFieldHighlightClasses.HOVERABLE);
    }

    if (!(event instanceof PointerEvent)) {
      return;
    }

    // if anything is clicked, the last highlighted markdown element is no longer clicked
    this.lastHighlightedMarkdownElement?.classList.remove(
      MarkdownFieldHighlightClasses.CLICKED
    );

    if (node?.field?.includes("Markdown")) {
      this.handleMarkdownFieldClick(node, event);
    } else {
      const openEditorButton = this.getOpenEditorButton();
      openEditorButton.classList.replace("enabled", "disabled");
      openEditorButton.disabled = true;
    }

    // Enables the 'Are you sure you want to leave' prompt when the user leaves the page.
    window.addEventListener("beforeunload", this.onAttemptedPageExit);
  }

  private onAttemptedPageExit(e: BeforeUnloadEvent) {
    e.preventDefault();

    // this message won't display on most browsers except possibly for Edge; on other browsers
    //  any truthy value will trigger the exit message
    return (e.returnValue =
      "Are you sure you want to leave?  Your changes may not be saved.");
  }

  // Sets up the editor modal to be used after some markdown field is clicked
  private handleMarkdownFieldClick(node: EditorNode, event: PointerEvent) {
    const openEditorButton = this.getOpenEditorButton();
    if (!(event.target instanceof HTMLElement)) {
      return;
    }

    event.target.classList.add(MarkdownFieldHighlightClasses.CLICKED);
    this.lastHighlightedMarkdownElement = event.target;
    this.lastHighlightedMarkdownNode = node;

    openEditorButton.classList.replace("disabled", "enabled");
    openEditorButton.disabled = false;

    // @ts-expect-error the type definition is wrong?  passing in the node.value string works. 
    const htmlContent = this.richTextEditor.clipboard.convert(node.value);
    this.richTextEditor.setContents(htmlContent);
  }

  // to save the expanded view of the editor
  private saveExpansionState(node, state) {
    state[node.getPath().join()] = node.expanded;
    if (node.childs) {
      node.childs.forEach((child) => this.saveExpansionState(child, state));
    }
  }

  // to restore the expanded view of the editor
  private restoreExpansionState(node, state) {
    if (state[node.getPath().join()]) node.expand(false);
    if (node.childs) {
      node.childs.forEach((child) => this.restoreExpansionState(child, state));
    }
  }

  private saveQuillMarkdownToEditor() {
    const data = this.editor.get();
    this.setDataField(
      data,
      this.lastHighlightedMarkdownNode.path,
      this.richTextEditor.root.innerHTML
    );

    this.editor.set(data);
    this.editor.refresh();
    this.closeRichTextModal();
  }

  /*
  - stops users from modifying field and value for markdown fields
  - stops users from modifying field names for the rest of the fields
  */
  private onEditorEditable(node: { field?: string }) {
    if (node && node.field && node.field.includes("Markdown")) {
      return {
        field: false,
        value: false,
      };
    }

    return {
      field: false,
      value: true,
    };
  }

  /**
   * @example getFormattedURL('/data?path=get-involved/volunteer') => 'Get Involved / Volunteer'
   * @returns
   */
  private getFormattedURL(url: string) {
    return url // get-involved/volunteer
      .replace(/-/g, " ") // get involved/volunteer
      .replace(/\//g, " / ") // get involved / volunteer
      .split(" ")
      .map((word: string) => {
        return word[0].toUpperCase() + word.substring(1);
      })
      .join(" ") // Get Involved / Volunteer
      .trim();
  }

  private async getFileData(): Promise<any> {
    const options = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    };

    const response = await fetch(this.sourceDataURL, options);
    const responseCodeClass = Math.floor(response.status / 100) * 100;

    if (responseCodeClass === 200) {
      return response.json();
    } else {
      switch (response.status) {
        case 400: {
          throw new Error(`Bad GET request to ${this.sourceDataURL}.`);
        }
        case 404: {
          throw new Error(
            `File not found from GET request to ${this.sourceDataURL}.`
          );
        }
        default: {
          throw new Error(
            `Unexpected ${response.status} error from GET request to ${this.sourceDataURL}.`
          );
        }
      }
    }
  }

  private saveData(link: string): void {
    const data = this.editor.get();

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    };

    fetch(link, options).then((response) => {
      const responseCodeClass = Math.floor(response.status / 100) * 100;
      const errMessage = `Failed to save ${this.name}`;
      const successMessage = `${this.name} saved successfully!`;

      if (responseCodeClass === 200) {
        showToast(successMessage, "success");

        // Disables 'are you sure you want to exit' prompt
        window.removeEventListener("beforeunload", this.onAttemptedPageExit);
      } else {
        switch (response.status) {
          case 400: {
            showToast(
              errMessage + `Bad POST request to ${this.sourceDataURL}.`,
              "fail"
            );
            throw new Error(`Bad POST request to ${this.sourceDataURL}.`);
          }
          case 401: {
            showToast(
              errMessage +
                `Unauthorized POST request to ${this.sourceDataURL}.`,
              "fail"
            );
            throw new Error(
              `Unauthorized POST request to ${this.sourceDataURL}.`
            );
          }
          case 403: {
            showToast(
              errMessage + `Forbidden POST request to ${this.sourceDataURL}`,
              "fail"
            );
            throw new Error(
              `Forbidden POST request to ${
                this.sourceDataURL
              } with data ${JSON.stringify(data)}`
            );
          }
          case 404: {
            showToast(
              errMessage +
                `File not found in POST request to ${this.sourceDataURL}.`,
              "fail"
            );
            throw new Error(
              `File not found in POST request to ${this.sourceDataURL}.`
            );
          }
          default: {
            showToast(
              errMessage +
                `Unexpected ${response.status} error from GET request to ${this.sourceDataURL}`,
              "fail"
            );
            throw new Error(
              `Unexpected ${response.status} error from GET request to ${this.sourceDataURL}`
            );
          }
        }
      }
    });
  }

  /*
  - updates a nested field in an object with a value, given a path.
  */
  private setDataField(
    dataObject: object,
    path: (string | number)[],
    value: string
  ) {
    if (path.length === 1) {
      dataObject[path[0]] = value;
      return;
    }
    return this.setDataField(dataObject[path[0]], path.slice(1), value);
  }
}
