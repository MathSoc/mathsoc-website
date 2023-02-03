/* eslint-disable-next-line */
class Editor {
  options: any;
  editor: any;
  sourceDataURL: string;
  name: string;

  constructor(
    container: HTMLElement,
    sourceDataURL: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    options?: {
      name?: string;
    }
  ) {
    this.options = {};
    this.sourceDataURL = sourceDataURL;
    this.editor = new window["JSONEditor"](container, this.options);

    this.name = this.getFormattedURL(this.sourceDataURL.split("path=")[1]);
    this.createSaveButton(container);

    (async () => {
      this.editor.set(await this.getFileData());
    })();
  }

  private createSaveButton(container: HTMLElement) {
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

      if (responseCodeClass === 200) {
        location.reload();
      } else {
        switch (response.status) {
          case 400: {
            throw new Error(`Bad POST request to ${this.sourceDataURL}.`);
          }
          case 401: {
            throw new Error(
              `Unauthorized POST request to ${this.sourceDataURL}.`
            );
          }
          case 403: {
            throw new Error(
              `Forbidden POST request to ${
                this.sourceDataURL
              } with data ${JSON.stringify(data)}`
            );
          }
          case 404: {
            throw new Error(
              `File not found in POST request to ${this.sourceDataURL}.`
            );
          }
          default: {
            throw new Error(
              `Unexpected ${response.status} error from GET request to ${this.sourceDataURL}`
            );
          }
        }
      }
    });
  }
}
