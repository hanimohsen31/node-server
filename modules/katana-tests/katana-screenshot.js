const express = require('express')
const router = express.Router()
const puppeteer = require('puppeteer')
const { PDFDocument } = require('pdf-lib')

// ---------------- DIVIDER files path --------------------------------------------------
// const fs = require('fs');
// const path = require('path');
// const debugDir = path.join(__dirname, 'debug-pdfs');
// if (!fs.existsSync(debugDir)) fs.mkdirSync(debugDir, { recursive: true });
// const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
// const filename = `dashboard-${timestamp}.pdf`;
// const filePath = path.join(debugDir, filename);

// ---------------- DIVIDER helper fucntions --------------------------------------------
function stopper(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// [1] open browser and navigate
async function openBrowser(baseUrl, viewportWidth, viewportHeight, zoomLevel) {
  // console.log("[1] starting scrapping", baseUrl)
  if (!baseUrl) return res.status(400).send('baseUrl required')
  const browser = await puppeteer.launch({
    headless: true, // <--- SHOW UI
    defaultViewport: null, // <--- Let it use your real screen size
    args: [
      '--start-maximized', // <--- Open in full window
      '--no-sandbox',
      '--disable-setuid-sandbox',
    ],
    devtools: false, // <--- Open Chrome DevTools
  })
  // console.log("[2] browser done", browser)
  const page = await browser.newPage()
  await page.setViewport({ width: +viewportWidth, height: +viewportHeight, deviceScaleFactor: +zoomLevel, isMobile: false }) // macbook-16
  // console.log("[3] page done", page)
  return { browser, page }
}

// [1] open browser and navigate
async function loginAndNavigateToDashboard(page, baseUrl, dashboardId) {
  // ******** LOGIN ********
  console.log('[4] start login', dashboardId)
  await page.goto(`${baseUrl}/auth/login`, { waitUntil: 'networkidle0' })
  await page.type('form.w-100 > :nth-child(1) > .p-inputtext', 'master@katana.com')
  await page.type('.p-password > .p-inputtext', 'P@ssw0rd')
  await page.click('#checkbox')
  // Attach intercept BEFORE clicking login
  const loginResp = page.waitForResponse((resp) => resp.url().includes('/login') && [200, 204, 304].includes(resp.status()))
  // Click the actual login button
  await page.click("button[type='submit']")
  // Wait for the login API to finish
  await loginResp

  // ******** CLICK TOGGLER ********
  // console.log("[5] start toggler")
  await page.waitForSelector('.toggler', { visible: true })
  await page.evaluate(() => document.querySelector('.toggler').click())

  // ******** NAVIGATE TO DASHBOARD ********
  // console.log("[6] start dashboard")
  const dashboardApiUrl = `/kd-server/api/dashboards/${dashboardId}`
  const dashboardResPromise = page.waitForResponse((resp) => {
    const urlMatches = resp.url().includes(dashboardApiUrl)
    const goodStatus = [200, 304].includes(resp.status())
    return urlMatches && goodStatus
  })
  await page.goto(`${baseUrl}/dashboard/${dashboardId}`, { waitUntil: 'networkidle0' })
  await dashboardResPromise
  await stopper(500) // wait 2 seconds = 2_000
}

async function loginAndNavigateToOpCommander(page, baseUrl, dashboardId) {
  // ******** LOGIN ********
  console.log('[4] start login', dashboardId)
  await page.goto(`${baseUrl}/auth/login`, { waitUntil: 'networkidle0' })
  await page.type('form.w-100 > :nth-child(1) > .p-inputtext', 'master@katana.com')
  await page.type('.p-password > .p-inputtext', 'P@ssw0rd')
  await page.click('#checkbox')
  // Attach intercept BEFORE clicking login
  const loginResp = page.waitForResponse((resp) => resp.url().includes('/login') && [200, 204, 304].includes(resp.status()))
  // Click the actual login button
  await page.click("button[type='submit']")
  // Wait for the login API to finish
  await loginResp

  // ******** CLICK TOGGLER ********
  // console.log("[5] start toggler")
  await page.waitForSelector('.toggler', { visible: true })
  await page.evaluate(() => document.querySelector('.toggler').click())

  // ******** NAVIGATE TO DASHBOARD ********
  // console.log("[6] start dashboard")
  const dashboardApiUrl = `/ufm-server/api/op_commander_dashboards/${dashboardId}`
  const dashboardResPromise = page.waitForResponse((resp) => {
    const urlMatches = resp.url().includes(dashboardApiUrl)
    const goodStatus = [200, 304].includes(resp.status())
    return urlMatches && goodStatus
  })
  await page.goto(`${baseUrl}/ufm/op-commander/${dashboardId}`, { waitUntil: 'networkidle0' })
  await dashboardResPromise
  await stopper(500) // wait 2 seconds = 2_000
}

// [2] take screenshot
async function pngScreenShot(page, styles, dashboardSelector, viewportWidth, viewportHeight, zoomLevel) {
  console.log('[7] start png screenshot')
  await page.setViewport({ width: +viewportWidth, height: +viewportHeight, deviceScaleFactor: +zoomLevel, isMobile: false }) // macbook-16
  await page.waitForSelector(dashboardSelector, { visible: true })
  stopper(500) // wait 2 seconds = 2_000

  // Apply CSS tweaks to prepare for screenshot
  const contentHeight = await page.evaluate(
    (passsedStyles, dashboardSel) => {
      // Remove ALL overflow restrictions from everything
      const style = document.createElement('style')
      style.textContent = passsedStyles
      document.head.appendChild(style)
      document.body.offsetHeight // Force layout recalculation

      // Run it before taking the screenshot
      document.querySelectorAll('*').forEach((el) => {
        if (!el.closest('gridster-item')) {
          el.style.overflow = 'visible'
          el.style.maxHeight = 'none'
        }
      })
      document.body.offsetHeight // Force layout recalculation

      // Get the element height
      const elm1 = document.querySelector(dashboardSel)?.scrollHeight || 0
      const elm2 = document.querySelector('.router-content')?.scrollHeight || 0
      const elm3 = document.querySelector('app-dashboard-details')?.scrollHeight || 0

      const docHeight = Math.max(
        document.body.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.clientHeight,
        document.documentElement.scrollHeight,
        document.documentElement.offsetHeight,
        document.documentElement.offsetHeight,
        elm1,
        elm2,
        elm3
      )

      document.documentElement.style.height = docHeight + 'px'
      document.body.style.height = docHeight + 'px'

      return docHeight
    },
    styles,
    dashboardSelector
  )

  console.log(`[7] Content height detected: ${contentHeight}px`)
  // Scroll through the entire page to force rendering
  await page.evaluate(async (totalHeight) => {
    await new Promise((resolve) => {
      let scrolled = 0
      const distance = 500 // Scroll 500px at a time
      const timer = setInterval(() => {
        window.scrollBy(0, distance)
        scrolled += distance
        console.log('scrolling', scrolled)
        if (scrolled > totalHeight) {
          clearInterval(timer)
          window.scrollTo(0, 0) // Scroll back to top
          resolve()
        }
      }, 100)
    })
  }, contentHeight)

  try {
    await page.evaluate(async () => {
      if (document.fonts && document.fonts.ready) await document.fonts.ready
    })
  } catch (err) {
    console.warn('Fonts did not fully load before screenshot:', err)
  }

  // Wait a bit for everything to settle
  stopper(2000) // wait 5 seconds = 5_000

  // Take screenshot of the specific element or full page
  const element = await page.$(dashboardSelector)
  const pngBuffer = await element.screenshot({ type: 'png' })
  return pngBuffer
}

// [3] convert to pdf
async function pdfScreenShot(pngBuffer) {
  const pdfDoc = await PDFDocument.create()
  const pngImage = await pdfDoc.embedPng(pngBuffer)
  const { width, height } = pngImage.size()
  const pdfPage = pdfDoc.addPage([width, height])
  pdfPage.drawImage(pngImage, { x: 0, y: 0, width, height })
  const pdfBytes = await pdfDoc.save()
  // Save debug PDF to file
  // fs.writeFileSync(filePath, pdfBytes)
  // console.log(`Debug PDF saved to: ${filePath}`)
  return pdfBytes
}

// ---------------- DIVIDER main function -----------------------------------------------
async function GetDashboardScreenShot(req, res) {
  const dashboardId = req.body.dashboardId
  const exportType = req.body.exportType || 'png'
  // const screenWidth = +req.body.screenWidth || 1920
  // const screenHeight = +req.body.screenHeight || 1080
  const viewportWidth = +req.body.viewportWidth || 1920
  const viewportHeight = +req.body.viewportHeight || 1080
  const zoomLevel = +req.body.zoomLevel || 1
  const dashboardSelector = req.body.dashboardSelector || 'app-dashboard-details'
  const moduleName = req.body.moduleName
  const styles =
    req.body.styles ||
    `
      nav {
        display: none !important;
      }
      .top-section{
        padding-top: 30px!important;
      }
      .top-section .buttons-group {
        visibility: hidden !important;
      }
      .dashboard-widgets-grid {
        padding-bottom: 30px !important;
      }
    `

  if (!moduleName) return res.status(400).send('module name not found')

  // console.log(req.body.styles)
  // const token = req.headers.authorization?.split(' ')[1]
  // if (!token) return res.status(401).send('Unauthorized')

  const baseUrl = req.headers.origin
  try {
    const { browser, page } = await openBrowser(baseUrl, viewportWidth, viewportHeight, zoomLevel)
    await loginAndNavigateToDashboard(page, baseUrl, dashboardId)
    const pngBuffer = await pngScreenShot(page, styles, dashboardSelector, viewportWidth, viewportHeight, zoomLevel)
    const pdfBytes = await pdfScreenShot(pngBuffer)
    // ******** SEND TO CLIENT ********
    if (exportType === 'png') {
      await browser.close()
      res.setHeader('Content-Type', 'image/png')
      res.setHeader('Content-Disposition', 'attachment; filename=dashboard.png')
      res.send(pngBuffer)
    } else {
      await browser.close()
      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader('Content-Disposition', 'attachment; filename=dashboard.pdf')
      res.send(Buffer.from(pdfBytes))
    }
  } catch (err) {
    console.error(err)
    res.status(500).send('Error generating screenshot')
  }
}

async function GetOpCommanderScreenShot(req, res) {
  const dashboardId = req.body.dashboardId
  const exportType = req.body.exportType || 'png'
  // const screenWidth = +req.body.screenWidth || 1920
  // const screenHeight = +req.body.screenHeight || 1080
  const viewportWidth = +req.body.viewportWidth || 1920
  const viewportHeight = +req.body.viewportHeight || 1080
  const zoomLevel = +req.body.zoomLevel || 1
  const dashboardSelector = req.body.dashboardSelector || 'app-dashboard-details'
  const moduleName = req.body.moduleName
  const styles =
    req.body.styles ||
    `
      nav {
        display: none !important;
      }
      .top-section{
        padding-top: 30px!important;
      }
      .top-section .buttons-group {
        visibility: hidden !important;
      }
      .dashboard-widgets-grid {
        padding-bottom: 30px !important;
      }
    `

  if (!moduleName) return res.status(400).send('module name not found')

  // console.log(req.body.styles)
  // const token = req.headers.authorization?.split(' ')[1]
  // if (!token) return res.status(401).send('Unauthorized')

  const baseUrl = req.headers.origin
  try {
    const { browser, page } = await openBrowser(baseUrl, viewportWidth, viewportHeight, zoomLevel)
    await loginAndNavigateToOpCommander(page, baseUrl, dashboardId)
    const pngBuffer = await pngScreenShot(page, styles, dashboardSelector, viewportWidth, viewportHeight, zoomLevel)
    const pdfBytes = await pdfScreenShot(pngBuffer)
    // ******** SEND TO CLIENT ********
    if (exportType === 'png') {
      await browser.close()
      res.setHeader('Content-Type', 'image/png')
      res.setHeader('Content-Disposition', 'attachment; filename=dashboard.png')
      res.send(pngBuffer)
    } else {
      await browser.close()
      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader('Content-Disposition', 'attachment; filename=dashboard.pdf')
      res.send(Buffer.from(pdfBytes))
    }
  } catch (err) {
    console.error(err)
    res.status(500).send('Error generating screenshot')
  }
}

// --------------------------  DIVIDER  routers -----------------------------------------
router.route('dashboard/:id').post(GetDashboardScreenShot)
router.route('op-commander/:id').post(GetOpCommanderScreenShot)
module.exports = router
