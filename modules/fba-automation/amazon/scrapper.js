const fs = require('fs')
const path = require('path')
const puppeteer = require('puppeteer')
const {
  cleanHtmlAndSave,
  randomDelay,
  IsAmazonBlocked,
  getButtonAndClick,
  clickAnywhereOutside,
  setDeliveryLocationInteractive,
  beforeChromeHandling,
  saveShadowDOM,
} = require('../../../utils/PuppeteerHelpers')

async function ScrapAmazonData(keywords, outputDir) {
  try {
    await beforeChromeHandling()
  } catch (err) {
    throw new Error('Error Happened In Opening Chrome Bash')
  }
  // ------------------------  DIVIDER  browser -------------------------------------------------------------
  // [1] open defualt browser
  const browser = await puppeteer.connect({
    browserURL: 'http://127.0.0.1:9222',
    defaultViewport: null,
  })
  const pages = await browser.pages()
  const page = pages[0] || (await browser.newPage())
  await page.bringToFront()

  // /* start looping */
  for (let i = 0; i < keywords.length; i++) {
    console.log(keywords[i])
    let startingTime = new Date().getTime()
    const keyword = keywords[i]
    const keywordDataOutput = path.join(outputDir, keyword)
    fs.mkdirSync(keywordDataOutput, { recursive: true })
    await page._client().send('Page.setDownloadBehavior', { behavior: 'allow', downloadPath: path.resolve(__dirname, keywordDataOutput) })

    // ------------------------  DIVIDER  Amazon -------------------------------------------------------------
    // [3] Go to Amazon (with keyword) and set location
    const searchUrl = `https://www.amazon.com/s?k=${encodeURIComponent(keyword).replace(/%20/g, '+')}`
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 10_000 })
    await new Promise((resolve) => setTimeout(resolve, 5_000)) // wait
    const initalContent = await page.content()
    if (IsAmazonBlocked(initalContent)) throw new Error(`❌ BLOCKED by Amazon for: "${keyword}"`)
    console.log('✅ Page Opened without any blockers')
    // check and set location
    const isEgypt = await page.evaluate(() => {
      const span = document.querySelector('span.nav-line-2.nav-progressive-content')
      if (!span) return false
      return span.textContent.trim().includes('Egypt')
    })
    if (isEgypt) await setDeliveryLocationInteractive(page, '10001')

    // ------------------------  DIVIDER  items ---------------------------------------------------------------
    const waitingTime = {
      searchExpander: { min: 15_000, max: 20_000 },
      xray: { min: 20_000, max: 40_000 },
      xrayKeywords: { min: 25_000, max: 45_000 },
    }

    // [4] get items in page
    try {
      await page.waitForSelector('[role="listitem"]', { timeout: 10_000 })
      console.log('✅ listitem loaded')
      await randomDelay()
    } catch (err) {
      console.log('❌ listitem not found — continuing:', err.message)
    }

    // [5] heluim10 => search results
    try {
      // click on search input
      await page.waitForSelector('#twotabsearchtextbox', { timeout: 30_000 })
      await page.click('#twotabsearchtextbox') // shall keyword aleardy in input field
      // click export
      await page.waitForSelector('#h10-search-expander', { timeout: 5_000 })
      await randomDelay(waitingTime.searchExpander.min, waitingTime.searchExpander.max)
      await getButtonAndClick(page, '#h10-search-expander', 'button', 'Export Data...')
      await randomDelay()
      // select xlsx
      await getButtonAndClick(page, '#h10-search-expander', '.sc-brSOsn.egKFry', '...as a CSV file')
      await randomDelay()
      await saveShadowDOM(page, '#h10-search-expander', `${keywordDataOutput}/${keyword}_h10-search-expander.html`)
      await randomDelay()
      // esc
      await clickAnywhereOutside(page)
      await randomDelay()
      console.log('✅ h10-search-expander loaded')
    } catch (err) {
      console.log('❌ h10-search-expander failed', err)
      // throw new Error('❌ h10-search-expander failed')
    }

    // [6] heluim10 => Analyze Products
    try {
      await getButtonAndClick(page, '#h10-serp-toolbar', 'button', 'Analyze Products')
      await page.waitForSelector('#h10-xray', { timeout: 30_000 })
      await randomDelay(waitingTime.xray.min, waitingTime.xray.max)
      // click export
      await getButtonAndClick(page, '#h10-xray', 'button', 'Export')
      await randomDelay()
      // select xlsx
      await getButtonAndClick(page, '#h10-xray', '.sc-brSOsn.egKFry', '...as a XLSX file')
      await randomDelay()
      // need to click on on chart icon
      // ---------------------------------------------------------------------------------
      try {
        await getButtonAndClick(page, '#h10-xray', '.sc-dnXEjN.gtDHdP .sc-eYJDIX.EYjnu svg', '')
        console.log('✅ Chart icon clicked')
        await randomDelay()
        // [2] Select 'All Time' from dropdown menu
        try {
          await getButtonAndClick(page, '#h10-xray', 'li', 'All Time')
          await randomDelay()
        } catch (err) {
          console.warn("⚠️ 'All Time' menu failed:", err.message)
        }

        // [0102] Select 'export icon' from dropdown menu
        try {
          await getButtonAndClick(page, '#h10-xray', '.highcharts-a11y-proxy-group-chartMenu button.highcharts-a11y-proxy-button', '')
          await randomDelay()
        } catch (err) {
          console.warn("⚠️ 'Export icon' menu failed:", err.message)
        }

        // [3] Click "Download CSV" in chart menu
        try {
          await getButtonAndClick(page, '#h10-xray', 'li', 'Download CSV')
          await randomDelay()
        } catch (err) {
          console.warn('⚠️ CSV download step failed:', err.message)
        }

        // [4] Click the Close button
        try {
          await getButtonAndClick(page, '#h10-xray', 'button.sc-cporns.sc-heIfNi.iNFqbA.WCrUs', '')
          console.log('✅ Chart closed')
          await randomDelay()
        } catch (err) {
          console.warn('⚠️ Chart close button not found:', err.message)
        }
      } catch (err) {
        console.warn('⚠️ Chart icon not found:', err.message)
      }

      // esc
      await page.evaluate(() => {
        const xray = document.querySelector('#h10-xray')
        if (xray) {
          xray.style.display = 'none'
          console.log('✅ h10-xray hidden')
        } else {
          console.warn('⚠️ h10-xray not found')
        }
      })
      await saveShadowDOM(page, '#h10-xray', `${keywordDataOutput}/${keyword}_h10-xray.html`)
      await randomDelay()
      console.log('✅ h10-xray loaded')
    } catch (e) {
      console.log('❌ h10-xray failed', e)
    }

    // [7] heluim10 Top Keywords
    try {
      await getButtonAndClick(page, '#h10-serp-toolbar', 'button', 'Top Keywords')
      await page.waitForSelector('#h10-xray-keywords', { timeout: 10_000 })
      await randomDelay(waitingTime.xrayKeywords.min, waitingTime.xrayKeywords.max)
      // click export
      await getButtonAndClick(page, '#h10-xray-keywords', 'button', 'Export Data...')
      await randomDelay()
      // select xlsx
      await getButtonAndClick(page, '#h10-xray-keywords', '.sc-brSOsn.egKFry', '...as a CSV file')
      await randomDelay()
      // esc
      await page.evaluate(() => {
        const xray = document.querySelector('#h10-xray-keywords')
        if (xray) {
          xray.style.display = 'none'
          console.log('✅ h10-xray hidden')
        } else {
          console.warn('⚠️ h10-xray not found')
        }
      })
      await saveShadowDOM(page, '#h10-xray-keywords', `${keywordDataOutput}/${keyword}_h10-xray-keywords.html`)
      await randomDelay()
      console.log('✅ h10-xray-keywords loaded')
    } catch (e) {
      console.log('❌ h10-xray-keywords failed', e)
    }

    // [8] get page content
    try {
      const htmlContent = await page.evaluate(() => {
        function serialize(node) {
          if (node.nodeType === Node.TEXT_NODE) return node.textContent
          if (node.nodeType !== Node.ELEMENT_NODE) return ''
          const tag = node.tagName.toLowerCase()
          let attrs = ''
          for (const attr of node.attributes) attrs += ` ${attr.name}="${attr.value}"`
          let inner = ''
          // Normal children
          node.childNodes.forEach((child) => (inner += serialize(child)))
          // Shadow DOM children
          if (node.shadowRoot) {
            inner += `<shadow-root>`
            node.shadowRoot.childNodes.forEach((child) => (inner += serialize(child)))
            inner += `</shadow-root>`
          }
          return `<${tag}${attrs}>${inner}</${tag}>`
        }
        return serialize(document.documentElement)
      })
      // const htmlContent = await page.content()
      await page.screenshot({ path: path.join(keywordDataOutput, 'items_list.jpg'), fullPage: true })
      cleanHtmlAndSave(htmlContent, path.join(keywordDataOutput, 'items_list.html'))
      console.log('✅ Saved page content')
    } catch (err) {
      console.log('❌ Failed saving HTML:', err.message)
    }

    const extPage = await browser.newPage();
    await extPage.goto(
      'chrome-extension://ofaokhiedipichpaobibbnahnkdoiiah/popup.html',
      { waitUntil: 'domcontentloaded' }
    );
    randomDelay(1000, 2000)
    await extPage.waitForSelector('#csv', { visible: true });
    await extPage.click('#csv');
    await extPage.waitForSelector('#xlsx', { visible: true });
    await extPage.click('#xlsx');

    let endingTime = new Date().getTime()
    let timeDiff = endingTime - startingTime
    console.log('✅ Time taken:', timeDiff / 1000, 'seconds')
  }
  // /* end looping */

  console.log('✅✅ All Operations done')
  // [9] close browser
  await page.close()
  await browser.close()
  return
}

module.exports = { ScrapAmazonData }
