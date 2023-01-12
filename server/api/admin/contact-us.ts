import { Request, Response } from 'express';

import { ReadWriteController } from '../read-write-controller.js';

class ContactUsAdmin {
  // Updates the name of each MathSoc exec
  static updateExecs(req: Request, res: Response) {
    const formData = req.body;

    const currentContactUs = require('../../data/contact-us.json');
    const currentExecs = currentContactUs.execs;

    try {
      for (const exec of currentExecs) {
        const translatedRole = exec.role.toLowerCase().replaceAll(/\s/g, '-').replaceAll(/,/g, '');
        const nameKey = translatedRole + '-name';

        exec.name = formData[nameKey].trim();
      }
    } catch (e) {
      res.status(400).end();
      return;
    }

    ReadWriteController.overwriteJSONData('contact-us', res, currentContactUs);

    res.status(200).end();
  }
}

module.exports = ContactUsAdmin;
