const express = require('express')
const router = express.Router()
const AmaraBot = require('./telegram-bot-model')
const TelegramBot = require('node-telegram-bot-api')
const BOT_TOKEN = process.env.TELEGRAM_TOKEN
// const bot = new TelegramBot(BOT_TOKEN, { polling: true, webHook: true })
const bot = isLocalhost() ? new TelegramBot(BOT_TOKEN, { polling: true }) : new TelegramBot(BOT_TOKEN, { webHook: true })
const { scrapeMarketplaceData } = require('../scrapper/marketplace')
const categoriesEnum = ['cars', 'gym', 'mems', 'courses', 'jobs', 'other']
const categoryKeyboard = {
  reply_markup: { inline_keyboard: categoriesEnum.map((cat) => [{ text: cat.toUpperCase(), callback_data: `cat:${cat}` }]) },
}

if (!isLocalhost()) {
  // Set webhook once (locally or in deploy script)
  bot.setWebHook(`https://node-server-seven-gamma.vercel.app/api/telegram/bot`)
}

// Handle all incoming messages
bot.on('message', async (msg) => {
  const chatId = msg.chat.id
  const messageText = msg.text || msg.caption || ''
  const username = msg.from.username || msg.from.first_name
  const urlMatch = messageText.match(/https:\/\/www\.facebook\.com\/marketplace\/item\/[^\s]+/)
  const category = ''
  const images = msg.photo || []

  if (messageText.match(/\/start/) || messageText.match(/\/help/)) {
    return
  }

  try {
    let finalResult = { username, chatId, messageText, message_id: msg.message_id, category, status: 'pending' }
    let responseMessage = `Message received.`

    if (urlMatch) {
      const url = urlMatch[0]
      let data = {}
      if (isLocalhost()) {
        data = await scrapeMarketplaceData(url)
      } else {
        data = { url }
      }
      finalResult = { ...finalResult, ...data }
    }

    if (images?.length) {
      const photo = images.at(-1)
      const fileId = photo.file_id
      const fileUrl = await bot.getFileLink(fileId)
      responseMessage += `\nI got your image 👍`
      finalResult = { ...finalResult, fileUrl }
    }

    await bot.sendMessage(chatId, responseMessage)
    await bot.sendMessage(chatId, 'Choose a category:', categoryKeyboard)
    await AmaraBot.create(finalResult)
  } catch (error) {
    console.error('Error sending to server:', error.message)
    await bot.sendMessage(chatId, 'Sorry, there was an error processing your message.')
  }
})

bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id
  const data = query.data // e.g. "cat:cars"
  if (!data.startsWith('cat:')) return
  console.log(data)
  const category = data.split(':')[1]
  const updated = await AmaraBot.findOneAndUpdate(
    { chatId, message_id: query.message.message_id, status: 'pending' }, // filter
    { category, status: 'saved' }, // update
    { new: true } // optional: return updated doc
  )
  if (!updated) {
    await bot.answerCallbackQuery(
      query.id
      // {text: 'Could not find the pending message. Please resend it.',show_alert: true,}
    )
    await bot.sendMessage(chatId, `Could not find the pending message. Please resend it.`)
    return
  }
  await bot.answerCallbackQuery(query.id)
  await bot.sendMessage(chatId, `Saved under category: ${category}`)
})

// Handle specific commands
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id
  bot.sendMessage(chatId, "Welcome! Send me any message and I'll forward it to the Express server.")
})

bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id
  bot.sendMessage(chatId, 'Just send me any text message and I will forward it to the Express server for processing.')
})

function isLocalhost() {
  const isVercel = !!process.env.VERCEL
  const isLocal = !isVercel
  return isLocal
}

// Endpoint to receive messages from Telegram bot
async function SendMessage(req, res) {
  const { chatId, message, username } = req.body
  // console.log('Received from Telegram:')
  // console.log('Chat ID:', chatId)
  // console.log('Username:', username)
  // console.log('Message:', message)
  res.json({ success: true, received: message })
}

// --------------------------  DIVIDER  routers -----------------------------------------
// router.route('/message').post(SendMessage)
router.route('/bot').post((req, res) => {
  bot.processUpdate(req.body)
  res.sendStatus(200)
})
module.exports = router
