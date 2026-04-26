const TelegramBot = require('node-telegram-bot-api')
const axios = require('axios')
const runCarReportPipeline = require('./car-report-pipeline')
const TELEGRAM_MESSAGE_LIMIT = 4000
let bot = null

function startCarReportTelegramBot() {
  const BOT_TOKEN = process.env.TELEGRAM_TOKEN
  if (!BOT_TOKEN) {
    console.warn('[car-report-telegram] TELEGRAM_TOKEN not set — bot disabled')
    return null
  }
  if (bot) return bot
  bot = new TelegramBot(BOT_TOKEN, { polling: true })
  bot.onText(/^\/start$/, (msg) => {
    bot.sendMessage(msg.chat.id, 'Send me a car PDF report (or paste/type the report text), and I will analyze it against the Egyptian used-car market.\n\nYou will receive:\n1. Full report (.json file)\n2. Plain extracted text\n3. Verdict summary')
  })
  bot.onText(/^\/help$/, (msg) => {
    bot.sendMessage(msg.chat.id, 'Commands:\n/start — intro\n/help — this message\n\nUsage: send a PDF document or paste report text. I will run the full pipeline and send back 3 messages: file, plain text, summary.')
  })
  bot.on('message', async (msg) => {
    const chatId = msg.chat.id
    const text = (msg.text || msg.caption || '').trim()
    // ignore commands (handled by onText)
    if (text === '/start' || text === '/help') return
    if (text === 'hi' || text === 'hello') {
      await bot.sendMessage(chatId, 'Hi!').catch(() => {})
      return
    }
    const hasPdf = msg.document && msg.document.mime_type === 'application/pdf'
    const hasWrongFile = msg.document && !hasPdf
    const hasText = !msg.document && text.length > 0
    if (hasWrongFile) {
      await bot.sendMessage(chatId, 'Only PDF files are accepted.').catch(() => {})
      return
    }
    if (!hasPdf && !hasText) return // nothing actionable
    try {
      let pdfBuffer = null
      let pdfSummary = null
      if (hasPdf) {
        await bot.sendMessage(chatId, 'Got the PDF — downloading...')
        const fileLink = await bot.getFileLink(msg.document.file_id)
        const dl = await axios.get(fileLink, { responseType: 'arraybuffer' })
        pdfBuffer = Buffer.from(dl.data)
      } else {
        pdfSummary = text
      }
      await bot.sendMessage(chatId, 'Starting car-report pipeline...')
      const result = await runCarReportPipeline({
        pdfBuffer,
        pdfSummary,
        onProgress: (m) => bot.sendMessage(chatId, m).catch(() => {}),
      })
      // [Message 3] verdict summary
      await sendLongMessage(bot, chatId, formatSummary(result))
      // [Message 1] full report file
      await bot.sendDocument(chatId, result.reportFilePath, { caption: 'Full report (JSON)' })
      // [Message 4] Prompot
      await bot.sendDocument(chatId, result.promptFilePath, { caption: 'Prompt (TEXT)' })
      // [Message 2] plain extracted/provided text
      // const plainHeader = 'Plain text:\n\n'
      // await sendLongMessage(bot, chatId, plainHeader + (result.pdfSummary || '(no text)'))
    } catch (err) {
      console.error('[car-report-telegram] error', err)
      await bot.sendMessage(chatId, `Failed: ${err.message}`).catch(() => {})
    }
  })

  bot.on('polling_error', (err) => {
    console.error('[car-report-telegram] polling_error', err.message)
  })

  console.log('[car-report-telegram] bot started (polling)')
  return bot
}

function formatSummary(result) {
  const ai = result.aiData || {}
  const a = result.analysis?.result

  const header = ['Summary', `Car: ${[ai.makeEnglish, ai.modelEnglish, ai.year].filter(Boolean).join(' ') || '(unknown)'}`, `Listed price: ${ai.price ?? '—'} EGP`, `Mileage: ${ai.mileage ?? '—'} km`, `Transmission: ${ai.transmission ?? '—'}`].join(
    '\n'
  )

  if (!a || typeof a !== 'object') {
    if (typeof a === 'string') return `${header}\n\n${a}`
    if (!result.hasMarketData) return `${header}\n\nNo market data was available — verdict skipped.`
    return `${header}\n\nVerdict generation failed.`
  }

  const lines = [header, '']
  if (a.finalVerdict) lines.push(`Verdict: ${a.finalVerdict}`)
  if (a.conditionScore != null) lines.push(`Condition: ${a.conditionScore}/10`)
  if (a.priceEvaluation) lines.push(`Price: ${a.priceEvaluation}`)
  if (a.estimatedFairPrice) lines.push(`Fair price: ${a.estimatedFairPrice.min} – ${a.estimatedFairPrice.max} EGP`)
  if (a.riskLevel) lines.push(`Risk: ${a.riskLevel}`)
  if (a.mainIssues?.length) lines.push('', 'Issues:', ...a.mainIssues.map((s) => `- ${s}`))
  if (a.positivePoints?.length) lines.push('', 'Positives:', ...a.positivePoints.map((s) => `- ${s}`))
  if (a.summary) lines.push('', a.summary)
  return lines.join('\n')
}

async function sendLongMessage(botInstance, chatId, text) {
  if (!text) return
  for (let i = 0; i < text.length; i += TELEGRAM_MESSAGE_LIMIT) {
    await botInstance.sendMessage(chatId, text.slice(i, i + TELEGRAM_MESSAGE_LIMIT))
  }
}

module.exports = { startCarReportTelegramBot }
