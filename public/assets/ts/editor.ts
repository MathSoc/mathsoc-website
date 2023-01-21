class Editor {
  options: any;
  editor: any;
  sourceDataURL: string;

  constructor(
    container: HTMLElement,
    sourceDataURL: string,
    initialJSON: string
  ) {
    this.options = {};
    this.sourceDataURL = sourceDataURL;
    this.editor = new window["JSONEditor"](container, this.options);
    this.editor.set(JSON.parse(initialJSON));
    this.createSaveButton(container);
  }

  private createSaveButton(container: HTMLElement) {
    const saveButton = document.createElement("button");
    saveButton.classList.add("save", "pink-button");
    saveButton.innerText = `Save "${this.getFormattedURL()}"`;
    saveButton.addEventListener("click", () => {
      this.saveData(`/api/data?path=${this.sourceDataURL}`);
    });

    const saveButtonContainer = document.createElement("div");
    saveButtonContainer.classList.add("save-button-container");

    saveButtonContainer.appendChild(saveButton);
    container.appendChild(saveButtonContainer);
  }

  /**
   * @example getFormattedURL('/get-involved/volunteer') => 'Get Involved / Volunteer'
   * @returns
   */
  private getFormattedURL() {
    return this.sourceDataURL // /get-involved/volunteer
      .substring(1) // get-involved/volunteer
      .replace(/-/g, " ") // get involved/volunteer
      .replace(/\//g, " / ") // get involved / volunteer
      .split(" ")
      .map((word: string) => {
        return word[0].toUpperCase() + word.substring(1);
      })
      .join(" ") // Get Involved / Volunteer
      .trim();
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

    fetch(link, options).then((res) => {
      if (res.status == 401) {
        console.error("BAD OBJECT SHAPE");
      } else {
        location.reload();
      }
    });
  }
}
