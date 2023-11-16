import { Term } from "../../../server/types/exam-bank";

class MeetingsPage {
  static init() {
    this.convertTermNames();
  }

  static async convertTermNames() {
    const termsList: Term[] = await fetch("/api/terms").then((res) =>
      res.json()
    );
    const termsToConvert = Array.from(
      document.getElementsByClassName("convert-term")
    );

    for (const termElement of termsToConvert) {
      const termData = termsList.find(
        (termInList) =>
          termInList.termCode === termElement.getAttribute("data-term-code")
      );

      termElement.innerHTML = termData.name;
    }
  }
}

MeetingsPage.init();
