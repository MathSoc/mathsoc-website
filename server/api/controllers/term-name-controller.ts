import { Logger } from "../../util/logger";
import fetch from "node-fetch";
import { Term } from "../../types/exam-bank";
import fs from "fs";
import tokens from "../../../config";

export class TermNameController {
  static logger = new Logger("Term Name Controller");

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

  static getTermNameFromTermCode(termCode: string) {
    const terms = this.getTermsFile();
    const target = terms.find((item) => item.termCode === termCode);
    return target?.name ?? termCode;
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
