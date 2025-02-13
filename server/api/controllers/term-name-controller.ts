import { Logger } from "../../util/logger";
import fetch from "node-fetch";
import { Term } from "../../types/exam-bank";
import fs from "fs";
import tokens from "../../../config";

export class TermNameController {
  static logger = new Logger("Term Name Controller");
  static termCache = new Map<string, string>(); // cache of termCodes

  static getTermsFile(): Term[] {
    try {
      const terms = fs.readFileSync("server/data/_hidden/term-list.json");
      return JSON.parse(terms.toString());
    } catch (err) {
      return [];
    }
  }

  static getTermNameFromTermCode(termCode: string) {
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
    termYear += term;
    const termName = season + " " + termYear;

    // Cache the result
    this.termCache.set(termCode, termName);

    return termName;
  }
}
