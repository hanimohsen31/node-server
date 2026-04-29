const fs = require('fs')
const os = require('os')
const cheerio = require('cheerio')
const puppeteer = require('puppeteer')
const https = require('https')
const path = require('path')
const { exec } = require('child_process')
const util = require('util')
const fetch = require('node-fetch')
const { spawn } = require('child_process')
const execAsync = util.promisify(exec)
const config = { headless: true, delayBetweenRequests: 5000, timeout: 30000 }


// Interactive location setting by clicking UI elements
async function setDeliveryLocationInteractive(page, zipCode = '10001') {
  try {
    console.log(`📍 Setting delivery location interactively to: ${zipCode}`)
    // Click on the delivery location element
    const locationSelector = '#nav-global-location-data-modal-action, #nav-packard-glow-loc-icon'
    await page.click(locationSelector).catch(() => {})

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

    const doneButtonSelector = '#a-autoid-136 , [data-action="GLUXConfirmAction"] , #GLUXConfirmClose , button[name="glowDoneButton"] , #GLUXConfirmClose-announce , .a-popover-footer button , .a-button.a-column.a-button-primary span'
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
  return content.includes('api-services-support@amazon.com') || content.includes('automated access') || content.includes('captcha') || content.length < 5000 // Very short content usually means blocking
}
