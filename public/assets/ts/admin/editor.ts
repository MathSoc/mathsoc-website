/* eslint-disable-next-line */
class Editor {
  options: {
    onEditable: (node: { field?: string }) => void;
    onEvent: (
      node: { field?: string; value?: string; path?: (string | number)[] },
      event: Event
    ) => void;
  };
  editor: any;
  sourceDataURL: string;
  name: string;
  rtEditor: any;

  constructor(container: HTMLElement, sourceDataURL: string) {
    this.rtEditor = new window["Quill"]("#quill-editor", { theme: "snow" });
    this.options = {
      onEditable: this.onEditorEditable,
      onEvent: this.onEditorEvent.bind(this),
    };

    this.sourceDataURL = sourceDataURL;
    this.editor = new window["JSONEditor"](container, this.options);

    this.name = this.getFormattedURL(this.sourceDataURL.split("path=")[1]);
    this.createButtons(container);

    (async () => {
      this.editor.set(await this.getFileData());
    })();
  }

  private createButtons(container: HTMLElement) {
    const openButton = document.createElement("button");
    openButton.innerHTML = "Open Markdown Editor";
    openButton.disabled = true;
    openButton.classList.add("open-editor-button", "disabled");
    openButton.id = "open-editor-btn";
    openButton.onclick = this.openRichTextModal;

    const openButtonContainer = document.createElement("div");
    openButtonContainer.classList.add("open-editor-container");
    openButtonContainer.appendChild(openButton);
    container.appendChild(openButtonContainer);

    const saveButton = document.createElement("button");
    saveButton.classList.add("save", "pink-button");
    saveButton.innerHTML = `Save <span class="editor-name">${this.name}</span>`;
    saveButton.addEventListener("click", () => {
      this.saveData(this.sourceDataURL);
    });

    const saveButtonContainer = document.createElement("div");
    saveButtonContainer.classList.add("save-button-container");

    saveButtonContainer.appendChild(saveButton);
    container.appendChild(saveButtonContainer);
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
  private onEditorEvent(
    node: { field?: string; value?: string; path?: (string | number)[] },
    event: Event
  ) {
    if (!(event instanceof PointerEvent)) {
      return;
    }

    const openEditorButton = document.getElementById(
      "open-editor-btn"
    ) as HTMLButtonElement;
    if (node && node.field && node.field.includes("Markdown")) {
      openEditorButton.classList.replace("disabled", "enabled");

      const htmlContent = this.rtEditor.clipboard.convert(node.value);
      this.rtEditor.setContents(htmlContent);

      const saveRichTextButton = document.getElementById(
        "save-rich-text-btn"
      ) as HTMLButtonElement;

      const cancelRichTextButton = document.getElementById(
        "cancel-rich-text-btn"
      ) as HTMLButtonElement;

      saveRichTextButton.onclick = () => this.saveQuillMarkdownToEditor(node);
      cancelRichTextButton.onclick = this.closeRichTextModal;

      openEditorButton.disabled = false;
    } else {
      openEditorButton.classList.replace("enabled", "disabled");
      openEditorButton.disabled = true;
    }
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

  private saveQuillMarkdownToEditor(node: {
    field?: string;
    value?: string;
    path?: (string | number)[];
  }) {
    const data = this.editor.get();
    this.setDataField(data, node.path, this.rtEditor.root.innerHTML);

    const state = {};
    this.saveExpansionState(this.editor.node, state);
    this.editor.set(data);
    this.editor.refresh();
    this.restoreExpansionState(this.editor.node, state);
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
