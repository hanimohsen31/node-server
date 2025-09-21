const nodemailer = require('nodemailer')
const fs = require('fs')
const path = require('path')
const dotenv = require('dotenv')
dotenv.config({ path: path.join(__dirname, '../../.env') });


const htmlFilePath = path.join(__dirname, '../../assets', 'output.html')
const htmlContent = fs.readFileSync(htmlFilePath, 'utf-8')

async function main() {
  try {
    let transporter = nodemailer.createTransport(process.env.Zoho_Connection_Url)

    let info = await transporter.sendMail({
      from: `"Local Test" <hani.rashed@digissquared.com>`, // must match your Zoho login domain
      to: 'hani.rashed@digissquared.com,hanimohsen31@gmail.com',
      subject: 'Zoho SMTP Test ✅',
      html: htmlContent, // use file content here
    })
    console.log('Message sent:', info.messageId)
  } catch (err) {
    console.error('Error sending email:', err)
  }
}

main()
