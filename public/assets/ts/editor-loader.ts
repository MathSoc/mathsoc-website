interface JSONResponse {
  endpoint: string;
  response: any;
}

class EditorLoader {
  static async init() {
    const sources = await this.getDataSources();

    const editorsContainer = document.getElementById("editors-container");

    for (const source of sources) {
      new Editor(editorsContainer, source.endpoint, source.response);
    }
  }

  static async getDataSources() {
    const sourcesList = document.getElementById("data-endpoints");

    if (sourcesList) {
      const sources: string[] = Array.from(
        sourcesList.querySelectorAll("span")
      ).map((span) => span.innerText);

      const results: JSONResponse[] = [];
      const promises = sources.map((source) =>
        this.getData(source).then((data) => {
          results.push({ endpoint: source, response: data });
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
