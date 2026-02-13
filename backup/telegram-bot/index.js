const cheerio = require("cheerio");
const fs = require("fs");

let telegramChannelsLinks = [
  "https://t.me/s/financialtest5000",
  "https://t.me/s/goldprice10000",
  "https://t.me/s/ajMubasher",
  "https://t.me/s/FOREXNEWS111",
  // "https://t.me/s/thndr2024/30578",
  // "https://t.me/thndr2024/27747"
];

// query string for loading more before=${messageId}
// https://t.me/s/FOREXNEWS111?before=18803

let sellectors = {
  messageWrapper: ".tgme_widget_message_wrap",
  sender: ".tgme_widget_message_owner_name",
  message: ".tgme_widget_message_text",
  views: ".tgme_widget_message_views",
  time: ".tgme_widget_message_date time",
  image: ".tgme_widget_message_photo_wrap",
};

// Array to store extracted messages
const messages = [];

async function startScrapping(link) {
  console.log("Scrapping Started: ", link);

  try {
    const response = await fetch(link);
    const html = await response.text();

    // const filePath = "./public/gold.html";
    // const html = fs.readFileSync(filePath, "utf-8");

    // Load the HTML into cheerio
    const $ = cheerio.load(html);

    $(sellectors.messageWrapper).each((index, element) => {
      const message = {
        text: $(element).find(sellectors.message).text().trim(),
        timestamp: $(element).find(sellectors.time).attr("datetime"),
        link: $(element).find(sellectors.time).parent().attr("href"),
        sender: $(element).find(sellectors.sender).text().trim(),
        image: $(element)
          .find(sellectors.image)
          .attr("style")
          ?.split("url")[1]
          ?.replace(`('`, "")
          ?.replace(`')`, "&&&")
          ?.split("&&&")[0],
        // ?.replace("&&&", ""),
      };
      messages.push(message);
    });

    console.log("Scraping Done: ", link);
  } catch (error) {
    console.error("Error scraping data:", error);
  }
}

function saveDataIntoFile() {
  const timestamp = Date.now();
  const filename = `./output/messages-${timestamp}.json`;
  fs.writeFileSync(filename, JSON.stringify(messages, null, 2));
  console.log("Files Saved: ", filename);
}

// Use a for loop to ensure sequential execution
async function scrapeAllChannels() {
  for (let i = 0; i < telegramChannelsLinks.length; i++) {
    await startScrapping(telegramChannelsLinks[i]);
  }
  saveDataIntoFile(); // Save data after all iterations are done
}

scrapeAllChannels()
