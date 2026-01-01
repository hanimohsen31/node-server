const puppeteer = require('puppeteer')
const {
  finalProfileLinkPart,
  finalImageItem,
  finalTitle,
  finalPrice,
  finalLocationAndTime,
  finalButtonSeeMore,
  finalDescription,
  finalImgPart,
  closeButton,
} = require('./marketplace-selectors.js')

async function scrapeMarketplaceData(url) {
  const browser = await puppeteer.launch({
    headless: true, // Set to true for production
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })
  try {
    const page = await browser.newPage()
    // Set viewport and user agent
    await page.setViewport({ width: 1920, height: 1080 })
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
    await page.goto(url, { waitForTimeout: 30000, waitUntil: 'networkidle2' })
    // Extract data
    const data = await page.evaluate(
      async (selectors) => {
        const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

        const closeButton = document.querySelector(selectors.closeButtonEval)
        if (closeButton) closeButton.click()
        await sleep(2500)

        const seeMoreButton = document.querySelector(selectors.seeMoreButton)
        if (seeMoreButton) seeMoreButton.click()
        await sleep(2500)

        const result = {
          title: null,
          price: null,
          locationAndTime: null,
          description: null,
          images: [],
          // sellerProfileLink: null,
          // sellerImageLink: null,
        }

        // Get title
        const titleEl = document.querySelector(selectors.title)
        if (titleEl) result.title = titleEl.innerText.trim()

        // Get price
        const priceEl = document.querySelector(selectors.price)
        if (priceEl) result.price = priceEl.innerText.trim()

        // Get location and time
        const locationEl = document.querySelector(selectors.locationAndTime)
        if (locationEl) result.locationAndTime = locationEl.innerText.trim()

        // Get description
        const descEl = document.querySelector(selectors.description)
        if (descEl) result.description = descEl.innerText.trim()

        // Get images
        const imgElements = document.querySelectorAll(selectors.images)
        imgElements.forEach((img) => {
          if (img.src) result.images.push(img.src)
        })

        // Get seller profile link
        // const profileLinkEl = document.querySelector(selectors.profileLink)
        // if (profileLinkEl) result.sellerProfileLink = profileLinkEl
        // else console.log('could not find profileLinkEl', selectors.profileLink)

        // Get seller image link
        // const imgPartEl = document.querySelector(selectors.imgPart)
        // if (imgPartEl) result.sellerImageLink = imgPartEl
        // else console.log('could not find imgPartEl', selectors.imgPart)

        return result
      },
      {
        title: finalTitle,
        price: finalPrice,
        locationAndTime: finalLocationAndTime,
        description: finalDescription,
        images: finalImageItem,
        profileLink: finalProfileLinkPart,
        imgPart: finalImgPart,
        seeMoreButton: finalButtonSeeMore,
        closeButtonEval: closeButton,
      }
    )
    return data
  } catch (error) {
    console.error('Error scraping data:', error)
    throw error
  } finally {
    await browser.close()
  }
}

module.exports = { scrapeMarketplaceData }

// Usage example
// ;(async () => {
//   const url =
//     'https://www.facebook.com/marketplace/item/2623347754691094/?ref=search&referral_code=null&referral_story_type=post&tracking=browse_serp%3A1860786d-9077-4c77-b9cf-07e4548f76d7'
//   try {
//     const data = await scrapeMarketplaceData(url)
//     console.log('\n=== Extracted Data ===')
//     console.log(JSON.stringify(data, null, 2))
//   } catch (error) {
//     console.error('Failed to scrape:', error)
//   }
// })()
