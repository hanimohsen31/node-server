// ----------------  DIVIDER  imports -------------------------------------------------------------
const express = require('express')
const router = express.Router()
const fs = require('fs')
const path = require('path')
const hljs = require('highlight.js')
const MarkdownIt = require('markdown-it')
// const { exec } = require('child_process')
const baseRoute = 'markdown'

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return `<pre class="hljs"><code>` + hljs.highlight(str, { language: lang }).value + `</code></pre>`
      } catch (__) { }
    }
    return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`
  },
})

async function readFiles(folderPath = process.env.MARKDOWN_DIR_PATH) {
  try {
    // const ROOT_DIR = path.join(__dirname, folderPath)
    const ROOT_DIR = path.isAbsolute(folderPath)
      ? folderPath
      : path.join(__dirname, folderPath)
    const files = fs
      .readdirSync(ROOT_DIR, { withFileTypes: true, })
      .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
      .map((entry) => entry.name)
      .filter((file) => file !== 'overall.md')
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    return { files, ROOT_DIR }
  } catch (err) {
    return { files: [], ROOT_DIR }
  }
}

// ----------------  DIVIDER  apis ----------------------------------------------------------------
// Home – list markdown files
async function GetMarkdownList(req, res) {
  const { files, ROOT_DIR } = await readFiles(req.params.folderPath)
  let list = files.map((file) => `<li><a href="/${baseRoute}/view/${encodeURIComponent(file)}">${file}</a></li>`).join('')
  list += `<li><a href="/${baseRoute}/view/overall">Overall (Live)</a></li>`
  let htmlContent = `
  <div class='markdown-list-container'>
    <h1>Markdown Files</h1>
    ${files.length === 0 ? '<p>No markdown files found.</p>' : `<ul>${list}</ul>`}
    <!-- <button id="createOverallBtn" class="btn btn-primary mt-3">Create Overall File</button> -->
  </div>`
  let hmtlTemplate = CreateBaseHtml('File Viewer', htmlContent)
  res.send(hmtlTemplate)
}

// View markdown file
async function GetMarkdownFile(req, res) {
  const { files, ROOT_DIR } = await readFiles(req.params.folderPath)
  const fileName = req.params.file
  if (fileName.toLowerCase() === 'overall') {
    // Read and parse all files
    let contentHeaders = files
      .map((file) => `<a class="btn btn-primary flex-grow-1 text-center" style='text-decoration: none;' href="#${encodeURIComponent(file)}">${file.split('.')[0]}</a>`)
      .join('')
    contentHeaders = `<div class='d-flex gap-1'>${contentHeaders}</div>`

    const allContent = files
      .map((file) => {
        const markdown = fs.readFileSync(path.join(ROOT_DIR, file), 'utf-8')
        const html = md.render(markdown)
        return `<h2 class='bg-primary text-white p-2' style='border-radius: 5px;' id='${file}'>${file}</h2>\n${html}`
      })
      .join('<hr />')

    let htmlContent = `<div class='markdown-body mx-auto bg-white text-black' dir="auto">${contentHeaders}${allContent}</div>`
    let hmtlTemplate = CreateBaseHtml('OverAll', htmlContent)

    res.send(hmtlTemplate)
  } else {
    const filePath = path.join(ROOT_DIR, fileName)
    if (!fileName.endsWith('.md') || !fs.existsSync(filePath)) return res.status(404).send('File not found')
    const markdown = fs.readFileSync(filePath, 'utf-8')
    let htmlContent = md.render(markdown)
    htmlContent = `<div class='container markdown-body mx-auto bg-white text-black' dir="auto">${htmlContent}</div>`
    let hmtlTemplate = CreateBaseHtml(fileName, htmlContent)
    res.send(hmtlTemplate)
  }
}

// Create overall.md file combining all markdown files
async function CreateOverall(req, res) {
  const { files, ROOT_DIR } = await readFiles(req.params.folderPath)
  if (files.length === 0) return res.status(400).send('No markdown files found to combine.')
  const combinedContent = files
    .map((file) => `# FILE ${file}\n\n${fs.readFileSync(path.join(ROOT_DIR, file), 'utf-8')}`)
    .join('\n\n---\n\n')
  const outputPath = path.join(ROOT_DIR, 'overall.md')
  fs.writeFileSync(outputPath, combinedContent, 'utf-8')
  res.send({ success: true, message: `overall.md created!`, file: 'overall.md' })
}

// ----------------  DIVIDER  routes -----------------------------------
router.route('/').get(GetMarkdownList)
router.route('/view/:file').get(GetMarkdownFile)
// router.route('/create-overall').post(CreateOverall)
module.exports = router

// ----------------  DIVIDER  utils -----------------------------------
const highlight = {
  dark: `https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/styles/vs2015.min.css`,
  monokai: `https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/styles/monokai.min.css`,
  // solarizedLight: `https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/styles/solarized-light.min.css`,
  atomOneDark: `https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/styles/atom-one-dark.min.css`,
  // dracula: `https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/styles/dracula.min.css`,
}

const globalSyles = `
  <link
    href="https://fonts.googleapis.com/css2?family=Ubuntu:ital,wght@0,300;0,400;0,500;0,700;1,300;1,400;1,500;1,700&display=swap"
    rel="stylesheet"
  />
  <link
    rel="stylesheet"
    href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.3/css/bootstrap.min.css"
    integrity="sha512-jnSuA4Ss2PkkikSOLtYs8BlYIeeIK1h99ty4YfvRPAlzr377vr3CXDb7sb7eEEBYjDtcYj+AjBH3FLv5uSJuXg=="
    crossorigin="anonymous"
    referrerpolicy="no-referrer"
  />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.2.0/github-markdown.min.css">
  <link rel="stylesheet" href="${highlight.dark}">
  <style>
  *{
    box-sizing: border-box;
    }
  .markdown-body {
      unicode-bidi: plaintext;
      direction: auto;
    }
  .markdown-body > * {
      unicode-bidi: plaintext;
      direction: auto;
    } 
    .markdown-body table th,.markdown-body table tr,.markdown-body table td{
      background-color: transparent !important;
    }
    .markdown-body blockquote{
      color:#3d1e24 !important;
    }
  </style>
  <style>
      #goTopBtn {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 44px;
      height: 44px;
      border: none;
      border-radius: 50%;
      background: #0d6efd;
      color: #fff;
      font-size: 20px;
      cursor: pointer;
      display: none;
      z-index: 1000;
      box-shadow: 0 6px 18px rgba(0, 0, 0, 0.25);
      transition: all 0.3s ease;
    }
    #goTopBtn:hover {
      background: #0b5ed7;
    }
  </style>
`

const globalScripts = ` 
  <script
    src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.3/js/bootstrap.bundle.min.js"
    integrity="sha512-7Pi/otdlbbCR+LnW+F7PwFcSDJOuUJB3OxtEHbg4vSMvzvJjde4Po1v4BR9Gdc9aXNUNFVUY+SK51wWT8WF0Gg=="
    crossorigin="anonymous"
    referrerpolicy="no-referrer"
  ></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/highlight.min.js"></script>
  <script>
    function startsWithArabic(text) {
      if (!text) return false;
      const firstChar = text.trim()[0];
      return /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(firstChar);
    }
    function containsArabic(text) {
      if (!text) return false;
      return /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(text);
    }   
    function applyRTLToElements(selector = '.markdown-body *') {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        const text = el.textContent || el.innerText;
        if (containsArabic(text)) {
          el.style.direction = 'rtl';
          el.style.textAlign = 'right'; 
          // Only apply border color for blockquotes
          if (el.tagName.toLowerCase() === 'blockquote') {
            el.style.borderRight = '.25em solid var(--color-border-default)';
            el.style.borderLeft = 'none';
          }
        } else {
          el.style.direction = 'ltr';
          el.style.textAlign = 'left';
        }
      });
    }
    applyRTLToElements()
  </script>
  <script>
    const btn = document.getElementById('createOverallBtn');
    if(btn){
      btn.addEventListener('click', async () => {
        btn.disabled = true;
        btn.textContent = 'Creating...';
        try {
          const res = await fetch('/create-overall', { method: 'POST' });
          const data = await res.json();
          alert(data.message);
        } catch (err) {
          alert('Error creating overall.md');
        } finally {
          btn.disabled = false;
          btn.textContent = 'Create Overall File';
        }
      });
    }
  </script>
  <script>
    const goTopBtn = document.getElementById('goTopBtn')
    if(goTopBtn) {
      window.addEventListener('scroll', () => {
        if(window.scrollY > 300){
          goTopBtn.style.display = 'block'
        }else{
          goTopBtn.style.display = 'none'
        }
      })
      goTopBtn.addEventListener('click', () => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth',
        })
      })
    }
  </script>
`

const navbar = (fileName = '') => `
  <nav class="navbar navbar-expand-lg bg-body-tertiary">
    <div class="container-fluid">
      <a class="navbar-brand" href="/${baseRoute}">Home</a>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav">
          <li class="nav-item">
            <a class="nav-link" href="#">${fileName.split('.')[0].toUpperCase()}</a>
          </li>
        </ul>
      </div>
    </div>
  </nav>
`

function CreateBaseHtml(pageTitle = '', content = '', scripts = '') {
  return `
  <!doctype html>
  <html lang="en">
  <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>${pageTitle}</title>
      ${globalSyles}
  </head>
  <body>
      ${navbar(pageTitle)}
      <div class="container py-3">${content}</div>
      <button id="goTopBtn" aria-label="Go to top">↑</button>
      ${globalScripts}
      ${scripts}
  </body>
  </html>
`
}
