const nodemailer = require('nodemailer');
const validator = require('validator');
const contactUsData = require('../data/contact-us.json');
const Logger = require('./logger.js');

class ContactUsController {
  static logger = new Logger();

  static handleRequest(req, res) {
    if (!req.body) res.status(400).end();

    if (
      !this.validateText(req.body.name, 80)
      || !this.validateText(req.body.email, 320)
      || !validator.isEmail(req.body.email)
      || !this.validateText(req.body.subject, 200)
      || !this.validateText(req.body.message, 4000)) {
      res.status(400).end();
      this.logger.info('Contact Us email attempted with invalid parameters; not sent')
      return false;
    }

    const name = validator.escape(req.body.name),
      address = validator.escape(req.body.email),
      subject = validator.escape(req.body.subject),
      message = validator.escape(req.body.message);

    return this.sendMessage(name, address, subject, message);
  }

  static async sendMessage(name, address, subject, message) {
    if (!process.env.forms_gmail_sender_username) {
      this.logger.error(`No email username set in .env; message '${subject}' by ${name} <${address}> could not be sent`);
      return false;
    }
    if (!process.env.forms_gmail_sender_password) {
      this.logger.error(`No email password set in .env; message '${subject}' by ${name} <${address}> could not be sent`);
      return false;
    }
    if (process.env.NODE_ENV !== 'production' && contactUsData.inquiriesReceiver.includes('@mathsoc.uwaterloo.ca')) {
      this.logger.error(`Message '${subject}' by ${name} <${address}> was not sent to MathSoc email address to avoid cluttering real inboxes with test inquiries.`);
      return false;
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.forms_gmail_sender_username,
        pass: process.env.forms_gmail_sender_password
      }
    });

    const email = {
      from: process.env.forms_gmail_sender_username,
      to: contactUsData.inquiriesReceiver,
      headers: {
        'reply-to': address
      },
      subject: 'Website - ' + subject,
      text: `From: ${name} <${address}>\nSubject: ${subject}\n\n${message}`,
    };

    let success = true;
    transporter.sendMail(email, function (error, info) {
      if (error) {
        ContactUsController.logger.error(error);
        success = false;
      } else {
        ContactUsController.logger.info(`Email sent at ${new Date().toString()}: ${info.response}`);
      }
    });

    return success;
  }

  static validateText(value, maxLength) {
    if (!value || typeof value !== "string" || value.length > maxLength) {
      return false;
    }
    return true;
  }
}

module.exports = ContactUsController;
