const { PDFParse } = require('pdf-parse')
const cleanReportText = require('../utils/clean-report-text')

async function convertPdfToJson(input) {
  const options = typeof input === 'string' ? { url: input } : { data: input }
  const parser = new PDFParse(options)
  await parser.load()
  const [info, textResult] = await Promise.all([parser.getInfo(), parser.getText()])
  const rawText = textResult.pages.map((p) => p.text).join('\n')
  const cleanText = cleanReportText(rawText)

  return {
    cleanText,
    isEmpty: !cleanText || cleanText.trim().length < 50,
  }
}

module.exports = convertPdfToJson
