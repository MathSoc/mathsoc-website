import nodemailer from "nodemailer";
import validator from "validator";
import { Request, Response } from "express";
import volunteerAppData from "../../data-base/get-involved/volunteer-application.json";
import { Logger } from "../../util/logger";

export const emailDomain = "@mathsoc.uwaterloo.ca";

export class VolunteerApplicationController {
  static logger = new Logger();

  static handleRequest(req: Request, res: Response) {
    if (!req.body || !req.headers.referer) {
      res.status(400).end();
      return false;
    }

    const queryParams = req.headers.referer.split("?")[1];
    const role = VolunteerApplicationController.getRoleFromQueryParams(queryParams);
    const exec = VolunteerApplicationController.getExecFromQueryParams(queryParams);

    if (
      !this.validateText(req.body["first-name"], 100) ||
      req.body["preferred-name"].length > 100 ||
      !this.validateText(req.body["last-name"], 100) ||
      !this.validateText(req.body.email, 100) ||
      !validator.isEmail(req.body.email) ||
      !this.validateText(req.body.interest, 6000) ||
      !this.validateText(req.body.qualifications, 6000) ||
      req.body["more-info"].length > 6000 ||
      !volunteerAppData.roles.includes(role) ||
      !volunteerAppData.execs.includes(exec)
    ) {
      res.status(400).end();
      this.logger.info(
        "Volunteer application email attempted with invalid parameters; not sent"
      );
      return false;
    }

    const formBody = {
      firstName: validator.escape(req.body["first-name"]).trim(),
      preferredName: validator.escape(req.body["preferred-name"]).trim(),
      lastName: validator.escape(req.body["last-name"]).trim(),
      program: validator.escape(req.body.program),
      term: validator.escape(req.body.term),
      coop: validator.escape(req.body.coop),
      address: validator.escape(req.body.email),
      interest: validator.escape(req.body.interest).trim(),
      qualifications: validator.escape(req.body.qualifications).trim(),
      moreInfo: validator.escape(req.body["more-info"]).trim(),
      role: validator.escape(role),
      execAddress: validator.escape(exec) + "@mathsoc.uwaterloo.ca",
    };

    return this.sendMessage(formBody);
  }

  private static sendMessage(
    formBody: { firstName: any; preferredName?: any; lastName: any; program: string; term: string; coop: string; address: any; interest: string; qualifications: string; moreInfo?: string; role: string; execAddress: string; }
  ) {
    if (!process.env.forms_gmail_sender_username) {
      this.logger.error(
        `No email username set in .env; application by ${formBody.firstName}${formBody.preferredName ? ` "${formBody.preferredName}" ` : " "}${formBody.lastName} <${formBody.address}> could not be sent`
      );
      return false;
    }
    if (!process.env.forms_gmail_sender_password) {
      this.logger.error(
        `No email password set in .env; application by ${formBody.firstName}${formBody.preferredName ? ` "${formBody.preferredName}" ` : " "}${formBody.lastName} <${formBody.address}> could not be sent`
      );
      return false;
    }
    if (
      process.env.NODE_ENV !== "production" &&
      formBody.execAddress.includes("@mathsoc.uwaterloo.ca")
    ) {
      this.logger.error(
        `Application by ${formBody.firstName}${formBody.preferredName ? ` "${formBody.preferredName}" ` : " "}${formBody.lastName} <${formBody.address}> was not sent to MathSoc email address to avoid cluttering real inboxes with test inquiries.`
      );
      return false;
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.forms_gmail_sender_username,
        pass: process.env.forms_gmail_sender_password,
      },
    });

    const email = {
      from: process.env.forms_gmail_sender_username,
      to: formBody.execAddress,
      headers: {
        "reply-to": formBody.address,
      },
      subject: "Volunteer Application - " + formBody.role,
      text: `From: ${formBody.firstName}${formBody.preferredName ? ` (${formBody.preferredName}) ` : " "}${formBody.lastName} <${formBody.address}>\n
      Role: ${formBody.role}\n
      Program: ${formBody.program}\n
      Term: ${formBody.term}\n 
      For the term that you are looking to volunteer are you on co-op? ${formBody.coop}\n\n
      Please explain why you are interested in this volunteer role:\n\n
      ${formBody.interest}\n\n
      How are you qualified for this position? What ideas and skills can you bring with you?\n\n
      ${formBody.qualifications}\n\n
      Is there any other relevant information we should know while considering your application?\n\n
      ${formBody.moreInfo}`
    };

    let success = true;
    transporter.sendMail(email, function (error, info) {
      if (error) {
        VolunteerApplicationController.logger.error(error.message);
        success = false;
      } else {
        VolunteerApplicationController.logger.info(
          `Email sent at ${new Date().toString()}: ${info.response}`
        );
      }
    });

    return success;
  }

  static validateText(value: any, maxLength: number): boolean {
    if (!value || typeof value !== "string" || value.length > maxLength) {
      return false;
    }
    return true;
  }

  // Parses role from query string
  // e.g. "role=board-games-director&exec=vpo" > "Board Games Director"
  static getRoleFromQueryParams(query: string | undefined): string {
    if (!query) {
      return "";
    }
    const role = query
      .split('&')[0]
      .split('=')[1]
      .replace(/-/g, " ")
      .replace(/(^\w|\s\w)/g, m => m.toUpperCase());
    return role;
  }

  static getExecFromQueryParams(query: string | undefined): string {
    if (!query) {
      return "";
    }
    return (query.split('&')[1]).split('=')[1];
  }
}
