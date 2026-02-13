// Looking to send emails in production? Check out our Email API/SMTP product!
const Nodemailer = require('nodemailer')
const { MailtrapTransport } = require('mailtrap')
async function SendEmail(options) {
  const TOKEN = '4a682a2856618ff6f0fc742890226f8f'
  const transport = Nodemailer.createTransport(
    MailtrapTransport({
      token: TOKEN,
      testInboxId: 3148035,
    })
  )
  await transport
    .sendMail({
      from: {
        address: 'mail.reset@io.com',
        name: 'Mail Reset',
      },
      to: [options.email],
      subject: options.subject,
      text: options.message,
      category: 'Integration Test',
      sandbox: true,
    })
    .then(console.log, console.error)
}

module.exports = SendEmail
