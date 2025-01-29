import { Logger } from "../../util/logger";
import fetch from "node-fetch";
import { Term } from "../../types/exam-bank";
import fs from "fs";
import tokens from "../../../config";

export class TermNameController {
  static logger = new Logger("Term Name Controller");
  static termCache = new Map<string, string>(); // cache of termCodes

  static async getTermNames(): Promise<Term[]> {
    const url = `${tokens.WATERLOO_OPEN_API_BASE_URL}/Terms`;
    const response = await fetch(new URL(url), {
      method: "GET",
      headers: {
        "X-API-KEY": tokens.WATERLOO_OPEN_API_KEY as string,
        "Content-Type": "application/json",
      },
    });

    const terms: Term[] = await response.json();
    return terms;
  }

  static validateTerm(term: string): boolean {
    const terms = this.getTermsFile();
    const termCodes = terms.map((item) => item.termCode);

    return termCodes.includes(term);
  }

  static getTermsFile(): Term[] {
    try {
      const terms = fs.readFileSync("server/data/_hidden/term-list.json");
      return JSON.parse(terms.toString());
    } catch (err) {
      return [];
    }
  }

  static convertTermCodeToTermName(termCode: string) {
    if (this.termCache.has(termCode)) {
      return this.termCache.get(termCode); // Return from cache
    }
    // termCodes are either in the format of abcd or bcd.
    // assuming that a term code that starts with "2" i.e: 2bcd is a year in 2100
    // bc refers to the year XXbc
    let term = parseInt(termCode);
    let termYear = 1900;
    while (term > 1000) {
      termYear += 100;
      term -= 1000;
    }
    let monthNum = term % 10; // in theory, termCodes should always end in either 1, 5, or 9
    let season = "FALL";
    if (monthNum == 1) {
      season = "WINTER";
    } else if (monthNum == 5) {
      season = "SPRING";
    }
    term /= 10; // get rid of the ones digit
    term = Math.trunc(term);
    const termName = season + " " + termYear;

    // Cache the result
    this.termCache.set(termCode, termName);

    return termName;
  }

  static getTermNameFromTermCode(termCode: string) {
    const terms = this.getTermsFile();
    const target = terms.find((item) => item.termCode === termCode);
    return target?.name ?? this.convertTermCodeToTermName(termCode);
  }

  static async overwriteTermsFile() {
    try {
      const terms = await this.getTermNames();
      const url = "_hidden/term-list";
      const fullPath = `server/data/${url}.json`;

      fs.writeFileSync(fullPath, JSON.stringify(terms));
      this.logger.info("Terms file rewritten");
    } catch (err) {
      this.logger.error("Could not rewrite terms file.");
      this.logger.error(err);
    }
  }
}
