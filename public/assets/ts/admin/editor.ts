/* eslint-disable-next-line */
class Editor {
  options: any;
  editor: any;
  sourceDataURL: string;
  name: string;

  constructor(
    container: HTMLElement,
    sourceDataURL: string,
    options?: {
      name?: string;
    }
  ) {
    this.options = {};
    this.sourceDataURL = sourceDataURL;
    this.editor = new window["JSONEditor"](container, this.options);
    
    // @todo fix this
    this.name = this.getFormattedURL(this.sourceDataURL.split("path=")[1]);
    this.createSaveButton(container);

    (async () => {
      this.editor.set(await this.getFileData());
    })();
  }

  private createSaveButton(container: HTMLElement) {
    const saveButton = document.createElement("button");
    saveButton.classList.add("save", "pink-button");
    saveButton.innerText = `Save "${this.name}"`;
    saveButton.addEventListener("click", () => {
      this.saveData(`/api/data?path=${this.sourceDataURL}`);
    });

    const saveButtonContainer = document.createElement("div");
    saveButtonContainer.classList.add("save-button-container");

    saveButtonContainer.appendChild(saveButton);
    container.appendChild(saveButtonContainer);
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

    if (response.status == 400) {
      console.error("BAD REQUEST");
    } else {
      return response.json();
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

    fetch(link, options).then((res) => {
      if (res.status == 401) {
        console.error("BAD OBJECT SHAPE");
      } else {
        location.reload();
      }
    });
  }
}
