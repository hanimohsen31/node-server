const axios = require("axios");

async function sendTelegramMessage(MESSAGE) {
  const BOT_TOKEN = process.env.TELEGRAM_TOKEN;
  const CHAT_ID = process.env.TELEGRAM_BOT_CHAT_ID;
  MESSAGE = MESSAGE || "Hello from Node.js!";
  try {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    const response = await axios.post(url, { chat_id: CHAT_ID, text: MESSAGE });
    console.log("Message sent:", response.data.ok);
  } catch (err) {
    console.error("Error sending message:", err.message);
  }
}

module.exports = { sendTelegramMessage };