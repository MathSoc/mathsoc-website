class EditorLoader {
  static async init() {
    const editor = new Editor();

    this.initSaveButton(editor);

    const sources = await this.getDataSources();

    // @todo What if there are more than 1 data sources?  Create multiple Editors.
    if (sources.length === 1) {
      editor.useEditor(JSON.parse(sources[0]));
    }
  }

  static initSaveButton(editor: Editor) {
    const saveButton = document.getElementById("save-button");
    if (saveButton) {
      saveButton.addEventListener("click", () => {
        editor.saveData("/api/data?path=get-involved/volunteer");
      });
    }
  }

  static async getDataSources() {
    const sourcesList = document.getElementById("data-endpoints");

    if (sourcesList) {
      const sources: string[] = Array.from(
        sourcesList.querySelectorAll("span")
      ).map((span) => span.innerText);

      const results: string[] = [];
      const promises = sources.map((source) =>
        this.getData(source).then((data) => {
          results.push(data);
        })
      );

      await Promise.all(promises);

      return results;
    }
    return [];
  }

  static async getData(source: string): Promise<string> {
    return new Promise((resolve) => {
      const req = new XMLHttpRequest();
      req.addEventListener("load", callback);
      req.open("GET", `${window.location.origin}/api/data?path=${source}`);
      req.send();

      function callback(this: XMLHttpRequest) {
        resolve(this.responseText);
      }
    });
  }
}

EditorLoader.init();
