import { Request, Response } from "express";

import { ReadWriteController } from "../read-write-controller";

export class ContactUsAdminService {
  // Updates the name of each MathSoc exec
  static updateExecs(req: Request, res: Response): void {
    const formData = req.body;

    // this is likely to get overwritten by the JSON editor anyway
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const currentContactUs = require("../../data/contact-us.json");
    const currentExecs = currentContactUs.execs;

    try {
      for (const exec of currentExecs) {
        const translatedRole = exec.role
          .toLowerCase()
          .replaceAll(/\s/g, "-")
          .replaceAll(/,/g, "");
        const nameKey = translatedRole + "-name";

        exec.name = formData[nameKey].trim();
      }
    } catch (e) {
      res.status(400).end();
      return;
    }

    ReadWriteController.overwriteJSONDataPath(
      "contact-us",
      res,
      currentContactUs
    );

    res.status(200).end();
  }
}
