const fs = require('fs')
const os = require('os')
const cheerio = require('cheerio')
const puppeteer = require('puppeteer')
const https = require('https')
const path = require('path')
const fetch = require('node-fetch')
const config = { headless: true, delayBetweenRequests: 5000, timeout: 30000 }

async function getButtonAndClick(page, rootId, btnSelector, elementText) {
  console.log('Getting Button', elementText)
  const elementHandle = await page.evaluateHandle(
    ({ rootId, btnSelector, elementText }) => {
      function deepSearch(root) {
        if (!root) return null
        // Try to match inside current root
        const candidates = root.querySelectorAll?.(btnSelector) || []
        for (const btn of candidates) {
          if (!elementText || btn.textContent?.includes(elementText)) return btn
        }
        // Explore children of shadow DOM
        const children = root.children || []
        for (const child of children) {
          // If this child has a shadow root, recurse into it
          if (child.shadowRoot) {
            const found = deepSearch(child.shadowRoot)
            if (found) return found
          }
          // Also check regular DOM children recursively
          const found = deepSearch(child)
          if (found) return found
        }
        return null
      }
      const host = document.querySelector(rootId)
      if (!host) return null
      return deepSearch(host.shadowRoot || host)
    },
    { rootId, btnSelector, elementText }
  )
  const element = elementHandle.asElement?.()
  if (element) {
    // await elementHandle.evaluate(el => el.click())
    await elementHandle.evaluate((el) => {
      el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }))
    })
    console.log('✅ Clicked!')
  } else {
    console.log('❌ Button not found inside nested shadow DOM')
  }
}

async function clickAnywhereOutside(page) {
  await page.evaluate(() => {
    // Create a new button
    const btn = document.createElement('button')
    btn.id = 'myInjectedButton'
    btn.textContent = 'myInjectedButton Click Me!'
    document.body.appendChild(btn)
    // Optionally attach an event listener inside the page
    btn.addEventListener('click', () => {
      console.log('Button clicked!')
    })
  })

  // Now click it from Puppeteer side
  await page.click('#myInjectedButton')
}

function randomDelay(min = 1000, max = 5000, message = ' ') {
  let Timeout = Math.random() * (max - min) + min
  console.log('random waiting for', +(Timeout / 1000).toFixed(1), 'sec', message, '...')
  return new Promise((resolve) => setTimeout(resolve, Timeout))
}

async function downloadImageUpdated(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath)
    https
      .get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to get '${url}' (${response.statusCode})`))
          return
        }
        response.pipe(file)
        file.on('finish', () => file.close(resolve))
      })
      .on('error', reject)
  })
}

async function autoScroll(
  page,
  scrollDelay = 900, // time between scrolls
  distance = 1800, // pixels per scroll
  maxScrollTime = 30000 // maximum scrolling time (30s)
) {
  await page.evaluate(
    async (distance, scrollDelay, maxScrollTime) => {
      const startTime = Date.now()
      let lastHeight = document.body.scrollHeight
      while (Date.now() - startTime < maxScrollTime) {
        window.scrollBy(0, distance)
        await new Promise((res) => setTimeout(res, scrollDelay))
        const newHeight = document.body.scrollHeight
        if (newHeight <= lastHeight) {
          break
        }
        lastHeight = newHeight
      }
    },
    distance,
    scrollDelay,
    maxScrollTime
  )
}

function cleanHtmlAndSave(html, outputPath) {
  const $ = cheerio.load(html)
  $('script').remove()
  // $('style').remove()
  // $("svg").remove();
  // Remove inline styles
  // $('[style]').each((i, el) => {
  //   $(el).removeAttr('style')
  // })
  const cleanedHtml = $.html()
  fs.writeFileSync(outputPath, cleanedHtml, 'utf8')
  console.log('✅ Cleaned HTML and Saved')
}

async function saveShadowDOM(page, shadowHostSelector, outputFile) {
  const htmlContent = await page.evaluate((shadowHostSelector) => {
    function extractHTML(node) {
      if (!node) return ''
      let html = ''
      // Add text nodes directly
      if (node.nodeType === Node.TEXT_NODE) html += node.textContent
      // If element, start tag
      if (node.nodeType === Node.ELEMENT_NODE) {
        const attrs = Array.from(node.attributes || [])
          .map((a) => `${a.name}="${a.value}"`)
          .join(' ')
        html += `<${node.tagName.toLowerCase()}${attrs ? ' ' + attrs : ''}>`
      }
      // Recurse into shadowRoot first
      if (node.shadowRoot) {
        for (const child of node.shadowRoot.childNodes) {
          html += extractHTML(child)
        }
      }
      // Recurse into light DOM children
      for (const child of node.childNodes || []) {
        html += extractHTML(child)
      }
      // Close tag if element
      if (node.nodeType === Node.ELEMENT_NODE) html += `</${node.tagName.toLowerCase()}>`
      return html
    }
    const host = document.querySelector(shadowHostSelector)
    if (!host) return null
    return extractHTML(host)
  }, shadowHostSelector)
  if (!htmlContent) {
    console.warn(`⚠️ Shadow host "${shadowHostSelector}" not found`)
    return
  }
  fs.writeFileSync(path.resolve(outputFile), htmlContent, 'utf-8')
  console.log(`✅ Saved shadow DOM of "${shadowHostSelector}" to ${outputFile}`)
}

module.exports = {
  randomDelay,
  downloadImageUpdated,
  autoScroll,
  cleanHtmlAndSave,
  getButtonAndClick,
  clickAnywhereOutside,
  saveShadowDOM,
}
