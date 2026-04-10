const { JSDOM } = require('jsdom')

/**
 * Extracts post data from Facebook page HTML.
 * @param {string} html - Raw HTML string
 * @returns {Array<Object>} Array of post objects
 */
function Facebook(html) {
  const dom = new JSDOM(html)
  const document = dom.window.document

  function getPostContainer(storyMsgEl) {
    let el = storyMsgEl.parentElement
    while (el) {
      if (el.querySelectorAll('[data-ad-rendering-role="story_message"]').length > 1) {
        return storyMsgEl.parentElement
      }
      const hasMedia = el.querySelector('img[data-imgperflogname="feedImage"]')
      const hasReactions = el.querySelector('[aria-label*=": "][aria-label*=" people"]')
      if (hasMedia || hasReactions) return el
      if (!el.parentElement) break
      el = el.parentElement
    }
    return storyMsgEl.parentElement
  }

  function isPinnedPost(postContainer) {
    // Pinned posts have a "Pinned post" heading label in the DOM
    const headings = postContainer.querySelectorAll('h2, span')
    for (const el of headings) {
      if (el.textContent?.trim().toLowerCase() === 'pinned post') return true
    }
    return false
  }

  function extractFullText(msgEl) {
    const preview = msgEl.querySelector('[data-ad-comet-preview="message"]')
    if (!preview) return null

    const clone = preview.cloneNode(true)

    clone.querySelectorAll('[role="button"]').forEach((btn) => {
      const t = btn.textContent.trim().toLowerCase()
      if (t === 'see more' || t === 'see less') btn.remove()
    })

    return clone.textContent?.replace(/\s+/g, ' ').trim() || null
  }

  function extractPostLink(postContainer) {
    const anchors = postContainer.querySelectorAll('a[href*="/posts/"]')
    for (const anchor of anchors) {
      const href = anchor.getAttribute('href')
      if (!href) continue
      const clean = href.split('?')[0]
      if (clean.includes('/posts/')) {
        return clean.startsWith('http') ? clean : `https://www.facebook.com${clean}`
      }
    }

    const allAnchors = postContainer.querySelectorAll('a[href]')
    for (const anchor of allAnchors) {
      const text = anchor.textContent?.trim()
      const href = anchor.getAttribute('href') || ''
      if (/^(\d+[ydhm]|Just now|just now)$/.test(text) && href.includes('facebook.com')) {
        const clean = href.split('?')[0]
        return clean.startsWith('http') ? clean : `https://www.facebook.com${clean}`
      }
    }

    return null
  }

  // Normalize text for dedup comparison: lowercase + collapse whitespace
  function normalizeText(text) {
    return text.toLowerCase().replace(/\s+/g, ' ').trim()
  }

  const storyMessages = document.querySelectorAll('[data-ad-rendering-role="story_message"]')
  const seenTexts = new Set()

  return Array.from(storyMessages).reduce((acc, msgEl) => {
    try {
      const text = extractFullText(msgEl)
      if (!text) return acc

      const postContainer = getPostContainer(msgEl)

      // Skip pinned posts
      if (isPinnedPost(postContainer)) return acc

      // Skip duplicate posts (same normalized text)
      const normalized = normalizeText(text)
      if (seenTexts.has(normalized)) return acc
      seenTexts.add(normalized)

      const img = postContainer.querySelector('img[data-imgperflogname="feedImage"]')
      const imgLink = img?.closest('a[href*="facebook.com"]')
      const image = img
        ? {
            src: img.getAttribute('src') || null,
            alt: img.getAttribute('alt') || null,
            url: imgLink?.getAttribute('href')?.split('&__cft__')[0] || null,
          }
        : null

      const reactions = {}
      postContainer.querySelectorAll('[aria-label]').forEach((el) => {
        const match = el.getAttribute('aria-label')?.match(/^(\w+):\s*([\d.,KkMmBb]+)\s+people$/)
        if (match) reactions[match[1].toLowerCase()] = match[2]
      })

      const link = extractPostLink(postContainer)

      acc.push({
        text,
        image,
        link,
        reactions: Object.keys(reactions).length ? reactions : null,
      })
    } catch (e) {}
    return acc
  }, [])
}

module.exports = { Facebook }