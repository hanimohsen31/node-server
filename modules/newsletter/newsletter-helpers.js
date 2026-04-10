const axios = require('axios')
const cheerio = require('cheerio')

const BaseHtml = (hmtlContent) => `<html><head><title>AI Dashboard</title></head><body><h1>🔥 AI Trends Dashboard</h1>${hmtlContent}</body>`

const SOURCES = [
  {
    label: 'The RunDown',
    selector: '.embla__slide.relative.cursor-pointer',
    needAiParsing: false,
    links: ['https://www.therundown.ai/'],
  },
  {
    label: 'Tech Crunch',
    selector: 'ul.wp-block-post-template.is-layout-flow.wp-block-post-template-is-layout-flow li',
    needAiParsing: false,
    links: [
      'https://techcrunch.com/category/artificial-intelligence/',
      'https://techcrunch.com/category/apps/',
      'https://techcrunch.com/category/startups/',
      'https://techcrunch.com/latest/',
    ],
  },
  // {
  //   label: 'Reuters',
  //   selector: null,
  //   needAiParsing: true,
  //   links: [
  //     // 'https://www.reuters.com/',
  //     // 'https://www.reuters.com/technology/artificial-intelligence/',
  //     // 'https://www.reuters.com/world/iran/'
  //     'https://rss.app/feeds/v1.1/Tv1Dzb6i79yZ3Q1D.json',
  //   ],
  // },
  {
    label: 'Openai',
    selector: 'section .max-w-container.w-full .gap-3xl.flex.flex-col .group.relative',
    needAiParsing: true,
    links: ['https://openai.com/news/'],
  },
  {
    label: 'Amagazine',
    selector: null,
    needAiParsing: true,
    links: ['https://aimagazine.com/'],
  },
  {
    label: 'Superhuman',
    selector: 'div.transparent.h-full.cursor-pointer.overflow-hidden.rounded-lg.flex.flex-col.border',
    needAiParsing: false,
    links: ['https://www.superhuman.ai/'],
  },
  {
    label: 'Deepmind',
    selector: 'article.card.card-blog.card--small_h.card--is-link',
    needAiParsing: false,
    links: ['https://deepmind.google/blog/'],
  },
  {
    label: 'Ycombinator',
    selector: 'table#hnmain',
    needAiParsing: false,
    links: ['https://news.ycombinator.com/'],
  },
  {
    label: 'Artificialintelligence',
    selector: null,
    needAiParsing: true,
    aiParsing: true,
    links: ['https://www.artificialintelligence-news.com/'],
  },
  {
    label: 'Aiweekly',
    selector: null,
    needAiParsing: true,
    links: ['https://aiweekly.co/'],
  },
  {
    label: 'Reddit',
    selector: 'maian shreddit-feed',
    needAiParsing: false,
    links: ['https://www.reddit.com/r/LocalLLaMA/', 'https://www.reddit.com/r/programming/', 'https://www.reddit.com/r/MachineLearning/'],
  },
  {
    label: 'Github',
    selector: 'article.Box-row',
    needAiParsing: false,
    links: ['https://github.com/trending'],
  },
  {
    label: 'X',
    selector: 'article span[data-testid="tweetText"]',
    needAiParsing: false,
    links: ['https://x.com/sama', 'https://x.com/karpathy', 'https://x.com/gdb', 'https://x.com/GhareebElshaikh', 'https://x.com/Osama_Elzero'],
  },
  {
    label: 'Youtube',
    selector: '#contents ytd-rich-item-renderer',
    needAiParsing: false,
    links: [
      // 'https://www.youtube.com/@Fireship/videos',
      // 'https://www.youtube.com/@ThePrimeTimeagen/videos',
      // 'https://www.youtube.com/@aiexplained-official/videos',
      // 'https://www.youtube.com/@yehiatech/videos',
      // 'https://www.youtube.com/@freecodecamp/videos',
      // 'https://www.youtube.com/@NagdyWP/videos',
      // 'https://www.youtube.com/@TinaHuang1/videos',
      'UCsBjURrPoezykLs9EqgamOA',
      'UCUyeluBRhGPCW4rPe_UvBZQ',
      'UCNJ1Ymd5yFuUPtn21xtRbbw',
      'UCGP8LgaWO1lLfFQUQ2BA7rA',
      'UC8butISFwT-Wl7EV0hUK0BQ',
      'UCV5-PB2LLRn0v3LZ5Rqu2Xw',
      'UC2UXDak6o7rBm23k3Vv5dww',
    ],
  },
  {
    label: 'Facebook',
    // selector: '.html-div.xdj266r.x14z9mp.xat24cr.x1lziwak.xexx8yu.xyri2b.x18d9i69.x1c1uobl',
    needAiParsing: false,
    links: ['https://www.facebook.com/OsElzero', 'https://www.facebook.com/ghareebelshaikh.official'],
  },
    {
    label: 'GoogleNews',
    selector: null,
    needAiParsing: true,
    links: ['https://news.google.com/rss/search?q=when:24h+allinurl:reuters.com&ceid=US:en&hl=en-US&gl=US'],
  },
]

async function ScrapePage(browser, source, link) {
  console.log('Scrapping Started: ', link)
  const page = await browser.newPage()
  let { selector, label } = source
  try {
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36')
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined })
    })
    await page.goto(link, { waitUntil: 'networkidle2', timeout: 30000 })
    // wait for selector if provided
    if (selector) await page.waitForSelector(selector, { timeout: 10000 }).catch(() => null)
    const content = await page.evaluate((selector) => {
      if (selector && document.querySelectorAll(selector).length)
        return Array.from(document.querySelectorAll(selector))
          .map((el) => el.outerHTML)
          .join('')
      else return document.querySelector('body').innerHTML
    }, selector)
    await page.close()
    console.log('✅ Page Scrapped: ', link)
    return `<section style="margin:20px 0;" id="${label.replace(' ', '')}">${content}</section>`
  } catch (err) {
    await page.close()
    console.log('❌ Scrapping Failed', err)
    return ``
  }
}

async function ScrapeYoutubeChannel(link) {
  const url = `https://www.youtube.com/feeds/videos.xml?channel_id=${link}`
  const { data: xml } = await axios.get(url)
  const $ = cheerio.load(xml, { xmlMode: true })
  const articles = $('entry')
    .map((_, el) => {
      const videoId = $(el).find('yt\\:videoId').text()
      const channelId = $(el).find('yt\\:channelId').text()
      const title = $(el).find('title').first().text()
      const videoUrl = $(el).find('link[rel="alternate"]').attr('href') || ''
      const published = $(el).find('published').text()
      const updated = $(el).find('updated').text()
      const thumbnail = $(el).find('media\\:thumbnail').attr('url') || ''
      const description = $(el).find('media\\:description').text().trim()
      const views = $(el).find('media\\:statistics').attr('views') || ''
      return `<article
      data-video-id="${videoId}"
      data-channel-id="${channelId}"
      data-published="${published}"
      data-updated="${updated}"
      data-views="${views}">
      <a href="${videoUrl}"><h3>${title}</h3></a>
      <img src="${thumbnail}" />
      <p class="description">${description.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
    </article>`
    })
    .get()
    .join('\n')
  console.log(`✅ YouTube channel scraped: ${link}`)
  return `<section style="margin:20px 0;" id="Youtube">${articles}</section>`
}

async function ScrapeReutersPage(link) {
  return ``
}

async function ScrapeGoogleNews(link) {
  const { data: xml } = await axios.get(link)
  const $ = cheerio.load(xml, { xmlMode: true })
  const articles = $('item')
    .map((_, el) => {
      const title = $(el).find('title').text()
      const articleLink = $(el).find('link').text().trim()
      const pubDate = $(el).find('pubDate').text()
      const sourceName = $(el).find('source').text()
      const sourceUrl = $(el).find('source').attr('url') || ''
      return `<article data-pub-date="${pubDate}">
      <a href="${articleLink}" target="_blank"><h3>${title}</h3></a>
      <small><a href="${sourceUrl}" target="_blank">${sourceName}</a> &mdash; ${pubDate}</small>
    </article>`
    })
    .get()
    .join('\n')
  console.log(`✅ Google News scraped: ${link}`)
  return `<section style="margin:20px 0;" id="GoogleNews">${articles}</section>`
}

module.exports = { SOURCES, BaseHtml, ScrapePage, ScrapeYoutubeChannel, ScrapeReutersPage, ScrapeGoogleNews }
