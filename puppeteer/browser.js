const fs = require('fs')
const os = require('os')
const path = require('path')
const util = require('util')
const fetch = require('node-fetch')
const puppeteer = require('puppeteer')
const { spawn } = require('child_process')
const { exec } = require('child_process')
const execAsync = util.promisify(exec)
// variables
const config = { headless: true, profileMode: 'clone', delayBetweenRequests: 5000, timeout: 30000 }
const chromeDirName = 'ChromeClone'
const platform = process.platform
const { chromePath, defaultUserDataDir } = getChromePaths()
const profileSrc = path.join(defaultUserDataDir, 'Default')
const cloneUserDataDir = path.join(__dirname, chromeDirName)
let userDataDir = config.profileMode === 'clone' ? cloneUserDataDir : defaultUserDataDir
const remotePort = 9222

// helper function for selecting OS
function getChromePaths() {
  const platform = process.platform
  const home = os.homedir()
  if (platform === 'win32') {
    const localAppData = process.env.LOCALAPPDATA || path.join(home, 'AppData', 'Local')
    const programFiles = process.env['ProgramFiles'] || 'C:\\Program Files'
    const programFilesX86 = process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)'
    const candidateExes = [
      path.join(programFiles, 'Google', 'Chrome', 'Application', 'chrome.exe'),
      path.join(programFilesX86, 'Google', 'Chrome', 'Application', 'chrome.exe'),
      path.join(localAppData, 'Google', 'Chrome', 'Application', 'chrome.exe'),
    ]
    return {
      chromePath: candidateExes.find((p) => fs.existsSync(p)) || candidateExes[0],
      defaultUserDataDir: path.join(localAppData, 'Google', 'Chrome', 'User Data'),
    }
  }
  if (platform === 'darwin') {
    return {
      chromePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      defaultUserDataDir: path.join(home, 'Library', 'Application Support', 'Google', 'Chrome'),
    }
  }
  // linux & others
  const candidateExes = ['/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium', '/usr/bin/chromium-browser', '/snap/bin/chromium']
  return {
    chromePath: candidateExes.find((p) => fs.existsSync(p)) || 'google-chrome',
    defaultUserDataDir: path.join(home, '.config', 'google-chrome'),
  }
}

// helper function
async function waitForChrome(port = 9222, retries = 20) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/version`)
      if (res.ok) return true
    } catch (e) {}
    await new Promise((r) => setTimeout(r, 1000))
  }
  throw new Error('Chrome did not open debugging port')
}

async function launchChrome() {
  try {
    if (config.profileMode === 'clone' && !fs.existsSync(cloneUserDataDir)) {
      console.warn(`Clone user data dir not found at ${cloneUserDataDir}, falling back to default: ${defaultUserDataDir}`)
      userDataDir = defaultUserDataDir
    }
    const chromeProcess = spawn(
      `"${chromePath}"`,
      [
        `--remote-debugging-port=${remotePort}`,
        `--user-data-dir="${userDataDir}"`,
        '--process-per-site',
        '--disable-backgrounding-occluded-windows',
        '--disable-background-timer-throttling',
        '--disable-renderer-backgrounding',
        '--enable-gpu-rasterization',
        ...(config.headless ? ['--headless=new'] : []),
      ],
      { shell: true, detached: true, stdio: 'inherit' }
    )
    chromeProcess.unref()
    await waitForChrome(remotePort)
    console.log('Chrome launched in background using:', userDataDir)
  } catch (err) {
    console.error('Error in launchChrome:', err)
  }
}

async function killChrome() {
  console.log('Killing Chrome...')
  const killCmd = platform === 'win32' ? 'taskkill /F /IM chrome.exe' : platform === 'darwin' ? 'pkill -f "Google Chrome"' : 'pkill -f chrome'
  await execAsync(killCmd).catch((e) => console.warn('Kill Chrome warning:', e.message))
  console.log('Chrome killed successfully')
}

async function copyChromeProfile() {
  console.log('Copying Chrome profile from', profileSrc, 'to', cloneUserDataDir)
  if (!fs.existsSync(profileSrc)) {
    throw new Error(`Profile source not found: ${profileSrc}`)
  }
  const copyCmd = platform === 'win32' ? `xcopy /E /I /Y "${profileSrc}" "${cloneUserDataDir}\\Default"` : `mkdir -p "${cloneUserDataDir}" && cp -R "${profileSrc}" "${cloneUserDataDir}/Default"`
  await execAsync(copyCmd)
  console.log('Profile copied successfully')
}

async function checkChrome() {
  console.log('Checking DevTools endpoint...')
  const res = await fetch(`http://127.0.0.1:${remotePort}/json/version`)
  const json = await res.json()
  console.log('Chrome DevTools info:', json)
}

// Initialize browser and page with stealth enhancements
/* RETURN: { browser, page } */
async function initBrowser() {
  const browser = await puppeteer.launch({
    headless: config.headless,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled', '--disable-features=VizDisplayCompositor', '--no-first-run', '--no-default-browser-check', '--disable-default-apps', '--disable-popup-blocking'],
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
    deviceScaleFactor: 0.1,
    hasTouch: false,
    isLandscape: false,
    isMobile: false,
  })
  // Remove webdriver property
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined })
    // Overwrite languages property to use English
    Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] })
  })
  return { browser, page }
}

module.exports = { launchChrome, killChrome, copyChromeProfile, checkChrome, initBrowser }
