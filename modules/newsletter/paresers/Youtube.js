const { JSDOM } = require('jsdom')
const Parser = require('rss-parser')
const parser = new Parser()
const BASE_URL = 'https://www.youtube.com'

// function Youtube(html) {
//   // const dom = new JSDOM(html)
//   const dom = new JSDOM(`<!DOCTYPE html><html><body>${html}</body></html>`)
//   const document = dom.window.document
//   const items = document.querySelectorAll('ytd-rich-item-renderer')
//   return Array.from(items).reduce((acc, item) => {
//     try {
//       const thumbLink = item.querySelector('ytd-thumbnail a#thumbnail')
//       const href = thumbLink?.getAttribute('href') || null
//       const url = href ? `${BASE_URL}${href}` : null
//       const videoId = href?.match(/[?&]v=([^&]+)/)?.[1] || null
//       const thumbImg = item.querySelector('ytd-thumbnail img')
//       const thumbnail = {
//         src: thumbImg?.getAttribute('src') || null,
//         alt: thumbImg?.getAttribute('alt') || null,
//       }
//       const duration =
//         item.querySelector('ytd-thumbnail-overlay-time-status-renderer span[aria-label]')?.getAttribute('aria-label')?.trim() ||
//         item.querySelector('ytd-thumbnail-overlay-time-status-renderer')?.textContent?.replace(/\s+/g, ' ').trim() ||
//         null
//       const titleEl = item.querySelector('#video-title')
//       const title = titleEl?.textContent?.replace(/\s+/g, ' ').trim() || null
//       const channelEl = item.querySelector('#channel-name yt-formatted-string a, #channel-name a')
//       const channel = channelEl?.textContent?.replace(/\s+/g, ' ').trim() || null
//       const channelUrl = channelEl ? `${BASE_URL}${channelEl.getAttribute('href')}` : null
//       const metaSpans = Array.from(item.querySelectorAll('#metadata-line span.inline-metadata-item'))
//         .map((s) => s.textContent.replace(/\s+/g, ' ').trim())
//         .filter(Boolean)
//       const views = metaSpans[0] || null
//       const publishedAt = metaSpans[1] || null
//       const badge = item.querySelector('ytd-badge-supported-renderer .badge-style-type-simple')?.textContent?.trim() || null
//       if (title || url) acc.push({ videoId, title, url, channel, channelUrl, thumbnail, duration, views, publishedAt, badge })
//     } catch (e) {}
//     return acc
//   }, [])
// }

function Youtube(html) {
  const { document } = new JSDOM(html).window
  return Array.from(document.querySelectorAll('article')).reduce((acc, el) => {
    try {
      const videoId = el.getAttribute('data-video-id') || null
      const channelId = el.getAttribute('data-channel-id') || null
      const published = el.getAttribute('data-published') || null
      const updated = el.getAttribute('data-updated') || null
      const views = el.getAttribute('data-views') || null
      const url = el.querySelector('a')?.getAttribute('href') || null
      const title = el.querySelector('h3')?.textContent?.trim() || null
      const thumbnail = { src: el.querySelector('img')?.getAttribute('src') || null }
      const description = el.querySelector('.description')?.textContent?.trim() || null
      if (title || url) {
        acc.push({ videoId, channelId, title, url, thumbnail, description, views, publishedAt: published, updatedAt: updated })
      }
    } catch (e) {}
    return acc
  }, [])
}

module.exports = { Youtube }
