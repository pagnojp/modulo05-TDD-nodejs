const nodemailer = require('nodemailer')
const mailConfig = require('../../config/mail')

class MailService {
  async send(message) {
    const transporter = nodemailer.createTransport(mailConfig)
    return await transporter.sendMail(message)
  }
}

module.exports = new MailService()