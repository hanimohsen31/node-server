const fs = require('fs')
const cheerio = require('cheerio')
const puppeteer = require('puppeteer')
const https = require('https')
const path = require('path')
const { exec } = require('child_process')
const util = require('util')
const fetch = require('node-fetch')
const { spawn } = require('child_process')
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
          if (!elementText || btn.textContent?.includes(elementText)) {
            return btn
          }
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

// Interactive location setting by clicking UI elements
async function setDeliveryLocationInteractive(page, zipCode = '10001') {
  try {
    console.log(`📍 Setting delivery location interactively to: ${zipCode}`)
    // Click on the delivery location element
    const locationSelector = '#nav-global-location-data-modal-action, #nav-packard-glow-loc-icon'
    await page.click(locationSelector).catch(() => { })

    await randomDelay(1000, 2000)

    // Fill the zip code input
    const zipInputSelector = `#GLUXZipUpdateInput , #GLUXZipUpdateInput_0 , [data-action="GLUXPostalInputAction"] , input[name="zipCode"]`
    await page.waitForSelector(zipInputSelector, { timeout: 5000 })
    await page.click(zipInputSelector)
    console.log('1- zip input clicked')
    await page.evaluate((selector) => {
      document.querySelector(selector).value = ''
    }, zipInputSelector)
    await page.type(zipInputSelector, zipCode, { delay: 100 })
    console.log('2- zip input typed in')

    await randomDelay(1000, 2000)

    // Click apply/submit button
    const applySelector = `#GLUXZipUpdate , #GLUXZipUpdate-announce , .a-button-input[type="submit"] , [name="glowDoneButton"] , [data-action="GLUXPostalUpdateAction"]`
    await page.click(applySelector)
    console.log('3- apply button clicked')
    await randomDelay(2000, 3000)

    const doneButtonSelector =
      '#a-autoid-136 , [data-action="GLUXConfirmAction"] , #GLUXConfirmClose , button[name="glowDoneButton"] , #GLUXConfirmClose-announce , .a-popover-footer button , .a-button.a-column.a-button-primary span'
    await page.waitForSelector(doneButtonSelector, { visible: true })
    await page.click(doneButtonSelector)
    console.log('4- done Button clicked')

    await randomDelay(10000, 20000)
    console.log('✅ Delivery location set interactively')

    return true
  } catch (error) {
    console.error('❌ Interactive location setting failed:', error.message)
    return false
  }
}

// Check if we got blocked by Amazon
function IsAmazonBlocked(content) {
  return (
    content.includes('api-services-support@amazon.com') ||
    content.includes('automated access') ||
    content.includes('captcha') ||
    content.length < 5000
  ) // Very short content usually means blocking
}

// Add random delay between actions
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
  {
    scrollDelay = 900, // time between scrolls
    distance = 1800, // pixels per scroll
    maxScrollTime = 30000, // maximum scrolling time (30s)
  } = {}
) {
  // console.log("⏳ Auto scrolling started…");
  await page.evaluate(
    async (distance, scrollDelay, maxScrollTime) => {
      const startTime = Date.now()
      let lastHeight = document.body.scrollHeight
      while (Date.now() - startTime < maxScrollTime) {
        window.scrollBy(0, distance)
        await new Promise((res) => setTimeout(res, scrollDelay))
        const newHeight = document.body.scrollHeight
        if (newHeight <= lastHeight) {
          // console.log("✅ No more content to load.");
          break
        }
        lastHeight = newHeight
      }
    },
    distance,
    scrollDelay,
    maxScrollTime
  )
  // console.log("✅ Auto scrolling finished!");
}

// Initialize browser and page with stealth enhancements
async function initBrowser() {
  const browser = await puppeteer.launch({
    headless: config.headless,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled',
      '--disable-features=VizDisplayCompositor',
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-default-apps',
      '--disable-popup-blocking',
    ],
  })

  const page = await browser.newPage()

  // Set random user agent
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
  ]

  const randomUserAgent = userAgents[Math.floor(Math.random() * userAgents.length)]
  await page.setUserAgent(randomUserAgent)

  // Set viewport with slight variations
  await page.setViewport({
    width: 1366 + Math.floor(Math.random() * 100),
    height: 768 + Math.floor(Math.random() * 100),
    deviceScaleFactor: 1,
    hasTouch: false,
    isLandscape: false,
    isMobile: false,
  })

  // Remove webdriver property
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, 'webdriver', {
      get: () => undefined,
    })

    // Overwrite languages property to use English
    Object.defineProperty(navigator, 'languages', {
      get: () => ['en-US', 'en'],
    })
  })

  return { browser, page }
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

async function beforeChromeHandling() {
  const profileSrc = 'C:\\Users\\YOUR_USERNAME\\AppData\\Local\\Google\\Chrome\\User Data\\Default'
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  const newUserDataDir = 'C:\\hani\\ChromeClone'
  const remotePort = 9222
  try {
    // 1️⃣ Kill any Chrome process
    console.log('Killing Chrome...')
    await execAsync('taskkill /F /IM chrome.exe')
    console.log('Chrome killed successfully')

    // 2️⃣ Copy your Chrome profile
    // console.log('Copying Chrome profile...')
    // const profileSrc = 'C:\\Users\\YOUR_USERNAME\\AppData\\Local\\Google\\Chrome\\User Data\\Default'
    // const profileDest = 'C:\\hani\\ChromeClone'
    // await execAsync(`xcopy /E /I "${profileSrc}" "${profileDest}"`)
    // console.log('Profile copied successfully')

    // 3️⃣ Launch Chrome with remote debugging
    const chromeProcess = spawn(`"${chromePath}"`, [
      `--remote-debugging-port=${remotePort}`,
      `--user-data-dir=${newUserDataDir}`,
      '--process-per-site',
      '--disable-backgrounding-occluded-windows',
      '--disable-background-timer-throttling',
      '--disable-renderer-backgrounding',
      '--enable-gpu-rasterization',
      '--start-minimized'
    ], {
      shell: true,
      detached: true,
      stdio: 'inherit', // ignore
    })

    chromeProcess.unref() // allow Node to continue without waiting
    await waitForChrome(9222)
    console.log('Chrome launched in background.')

    // // 4️⃣ Check Chrome DevTools endpoint
    // console.log('Checking DevTools endpoint...')
    // const res = await fetch('http://127.0.0.1:9222/json/version')
    // const json = await res.json()
    // console.log('Chrome DevTools info:', json)
  } catch (err) {
    console.error('Error in BeforeChromeHandling:', err)
  }
}

async function waitForChrome(port = 9222, retries = 20) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/version`)
      if (res.ok) return true
    } catch (e) { }
    await new Promise((r) => setTimeout(r, 1000))
  }
  throw new Error('Chrome did not open debugging port')
}

async function saveShadowDOM(page, shadowHostSelector, outputFile) {
  const htmlContent = await page.evaluate((shadowHostSelector) => {
    function extractHTML(node) {
      if (!node) return ''

      let html = ''

      // Add text nodes directly
      if (node.nodeType === Node.TEXT_NODE) {
        html += node.textContent
      }

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
      if (node.nodeType === Node.ELEMENT_NODE) {
        html += `</${node.tagName.toLowerCase()}>`
      }

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
  initBrowser,
  randomDelay,
  downloadImageUpdated,
  autoScroll,
  cleanHtmlAndSave,
  getButtonAndClick,
  clickAnywhereOutside,
  setDeliveryLocationInteractive,
  IsAmazonBlocked,
  beforeChromeHandling,
  waitForChrome,
  saveShadowDOM,
}
