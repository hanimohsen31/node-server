const express = require('express')
const router = express.Router()
const puppeteer = require('puppeteer')
const { PDFDocument } = require('pdf-lib');

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
  return new Promise(resolve => setTimeout(resolve, ms));
}

// [1] open browser and navigate
async function openBrowserAndNavigate(baseUrl, dashboardId, pageWidth, pageHeight) {
  // console.log("[1] starting scrapping", baseUrl)
  if (!baseUrl) return res.status(400).send('baseUrl required')
  const browser = await puppeteer.launch({
    headless: true,             // <--- SHOW UI
    defaultViewport: null,       // <--- Let it use your real screen size
    args: [
      '--start-maximized',       // <--- Open in full window
      '--no-sandbox',
      '--disable-setuid-sandbox',
    ],
    devtools: false               // <--- Open Chrome DevTools
  })
  // console.log("[2] browser done", browser)
  const page = await browser.newPage()
  await page.setViewport({ width: pageWidth, height: pageHeight }) // macbook-16
  // console.log("[3] page done", page)

  // ******** LOGIN ********
  // console.log("[4] start login", dashboardId)
  await page.goto(`${baseUrl}/auth/login`, { waitUntil: "networkidle0" });
  await page.type('form.w-100 > :nth-child(1) > .p-inputtext', 'master@katana.com');
  await page.type('.p-password > .p-inputtext', 'P@ssw0rd');
  await page.click('#checkbox');
  // Attach intercept BEFORE clicking login
  const loginResp = page.waitForResponse(resp =>
    resp.url().includes("/login") && [200, 204, 304].includes(resp.status())
  );
  // Click the actual login button
  await page.click("button[type='submit']");
  // Wait for the login API to finish
  await loginResp;

  // ******** CLICK TOGGLER ********
  // console.log("[5] start toggler")
  await page.waitForSelector(".toggler", { visible: true });
  await page.evaluate(() => document.querySelector(".toggler").click());

  // ******** NAVIGATE TO DASHBOARD ********
  // console.log("[6] start dashboard")
  const dashboardApiUrl = `/kd-server/api/dashboards/${dashboardId}`;
  const dashboardResPromise = page.waitForResponse(resp => {
    const urlMatches = resp.url().includes(dashboardApiUrl);
    const goodStatus = [200, 304].includes(resp.status());
    return urlMatches && goodStatus;
  });
  await page.goto(`${baseUrl}/dashboard/${dashboardId}`, { waitUntil: "networkidle0" });
  await dashboardResPromise;
  await stopper(2000); // wait 2 seconds = 2_000
  return { browser, page }
}

/**
 * // TODO:
 * [1] make element containerSelector => height: fit-content;
 * [2] make element navbarSelector => display: none;
 * [3] make element buttonsGroup => visibility: hidden;
 * [4] need to wait dashboardSelector
 * [5] need to wait 
 */

// [2] take screenshot
async function pngScreenShot(browser, page, pageWidth, pageHeight) {
  // console.log("[7] start png screenshot")
  const navbarSelector = 'nav'
  const containerSelector = '.router-content'
  const dashboardSelector = 'app-dashboard-details'
  const buttonsGroup = '.top-section .buttons-group'
  await page.setViewport({ width: pageWidth, height: pageHeight });
  await page.waitForSelector(dashboardSelector, { visible: true });
  stopper(1000); // wait 2 seconds = 2_000

  // Apply CSS tweaks to prepare for screenshot
  const contentHeight = await page.evaluate(
    (navbarSel, containerSel, dashboardSel, buttonsSel) => {
      // Remove ALL overflow restrictions from everything
      const style = document.createElement('style');
      style.textContent = `
        *:not(gridster-item):not(.app-dashboard-widget){
          overflow: visible !important;
          max-height: none !important;
        }
        html, body {
          overflow: visible !important;
          max-height: none !important;
        }
        ${navbarSel} {
          display: none !important;
        }
        ${containerSel} {
          height: fit-content !important;
          overflow: visible !important;
          max-height: none !important;
        }
        .top-section{
          padding-top: 30px!important;
        }
        ${buttonsSel} {
          visibility: hidden !important;
        }
        .dashboard-widgets-grid {
          padding-bottom: 30px !important;
        }
      `;
      document.head.appendChild(style);
      document.body.offsetHeight; // Force layout recalculation
      return Math.max(
        document.body.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.clientHeight,
        document.documentElement.scrollHeight,
        document.documentElement.offsetHeight
      );
    },
    navbarSelector,
    containerSelector,
    dashboardSelector,
    buttonsGroup
  );

  // console.log(`[7] Content height detected: ${contentHeight}px`);

  // Scroll through the entire page to force rendering
  await page.evaluate(async (totalHeight) => {
    await new Promise((resolve) => {
      let scrolled = 0;
      const distance = 500; // Scroll 500px at a time
      const timer = setInterval(() => {
        window.scrollBy(0, distance);
        scrolled += distance;
        if (scrolled >= totalHeight) {
          clearInterval(timer);
          window.scrollTo(0, 0); // Scroll back to top
          resolve();
        }
      }, 100);
    });
  }, contentHeight);

  // Wait a bit for everything to settle
  stopper(1000); // wait 5 seconds = 5_000

  // Take screenshot of the specific element or full page
  const element = await page.$(dashboardSelector);
  const pngBuffer = await element.screenshot({ type: 'png' });
  return pngBuffer

}

// [3] convert to pdf
async function pdfScreenShot(pngBuffer, pageWidth, pageHeight) {
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
async function GetScreenShot(req, res) {
  const dashboardId = req.query.dashboardId
  const exportType = req.query.exportType
  const baseUrl = req.headers.origin
  const pageWidth = req.query.pageWidth || 1920
  const pageHeight = req.query.pageHeight || 1200
  try {
    const { browser, page } = await openBrowserAndNavigate(baseUrl, dashboardId, pageWidth, pageHeight)
    const pngBuffer = await pngScreenShot(browser, page, pageWidth, pageHeight)
    const pdfBytes = await pdfScreenShot(pngBuffer, pageWidth, pageHeight)
    // ******** SEND TO CLIENT ********
    if (exportType === 'png') {
      await browser.close()
      res.setHeader('Content-Type', 'image/png')
      res.setHeader('Content-Disposition', 'attachment; filename=dashboard.png')
      res.send(pngBuffer)
    } else {
      await browser.close()
      res.setHeader("Content-Type", "application/pdf")
      res.setHeader("Content-Disposition", "attachment; filename=dashboard.pdf")
      res.send(Buffer.from(pdfBytes))
    }

  } catch (err) {
    console.error(err)
    res.status(500).send('Error generating screenshot')
  }
}

// --------------------------  DIVIDER  routers -----------------------------------------
router.route('/:id').get(GetScreenShot)
module.exports = router
