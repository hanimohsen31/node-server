// ----------------  DIVIDER  imports -------------------------------------------------------------
const express = require('express')
const router = express.Router()
const fs = require('fs')
const path = require('path')
const hljs = require('highlight.js')
const MarkdownIt = require('markdown-it')
// const { exec } = require('child_process')
const baseRoute = 'markdown' // this for routing in node
const htmlPageTitle = {
  overAll: 'Overall',
  fileViwer: 'File Viewer',
}

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

async function readSingleDirFiles(folderPath = process.env.MARKDOWN_DIR_PATH) {
  try {
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

// Updated readFiles function (keeping the tree structure)
async function readFiles(folderPath = process.env.MARKDOWN_DIR_PATH) {
  try {
    const ROOT_DIR = path.isAbsolute(folderPath)
      ? folderPath
      : path.join(__dirname, folderPath)

    // Recursive function to build tree structure
    function buildTree(currentPath) {
      const items = fs.readdirSync(currentPath, { withFileTypes: true })
      const result = {
        name: path.basename(currentPath),
        path: currentPath,
        type: 'directory',
        children: []
      }

      // Separate directories and files
      const directories = items.filter(item => item.isDirectory())
      const files = items.filter(item =>
        item.isFile() &&
        item.name.endsWith('.md') &&
        item.name !== 'overall.md'
      )

      // Add files to current directory
      result.children.push(
        ...files
          .map(file => ({
            name: file.name,
            path: path.join(currentPath, file.name),
            type: 'file'
          }))
          .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))
      )

      // Recursively process subdirectories
      for (const dir of directories.sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { numeric: true })
      )) {
        const subDirPath = path.join(currentPath, dir.name)
        const subDirTree = buildTree(subDirPath)
        result.children.push(subDirTree)
      }

      return result
    }

    // Build the complete tree structure
    const fileTree = buildTree(ROOT_DIR)

    // Also maintain the flat list of all files for backward compatibility
    const allFiles = []

    function collectFiles(node) {
      if (node.type === 'file') {
        allFiles.push({
          name: node.name,
          path: node.path,
          relativePath: path.relative(ROOT_DIR, node.path)
        })
      } else if (node.type === 'directory') {
        node.children.forEach(child => collectFiles(child))
      }
    }

    collectFiles(fileTree)

    return {
      files: allFiles.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true })),
      fileTree, // Tree structure with all folders and files
      ROOT_DIR
    }

  } catch (err) {
    return {
      files: [],
      fileTree: {
        name: 'error',
        path: '',
        type: 'directory',
        children: []
      },
      ROOT_DIR
    }
  }
}


// ----------------  DIVIDER  apis ----------------------------------------------------------------
// Home – list markdown files with folder tree structure
async function GetMarkdownList(req, res) {
  const { fileTree, ROOT_DIR, files } = await readFiles(req.params.folderPath)

  // Function to recursively build HTML tree
  function buildTreeHTML(node, level = 0) {
    if (node.type === 'file') {
      const relativePath = path.relative(ROOT_DIR, node.path)
      return `<li class="file-item" style="margin-left: ${level * 20}px">
        <a href="/${baseRoute}/view/${encodeURIComponent(relativePath)}">${node.name}</a>
      </li>`
    } else {
      // Directory node
      let html = `<li class="directory-item" style="margin-left: ${level * 20}px">
        <details ${level === 0 ? 'open' : ''}>
          <summary class="directory-summary">
            <span class="folder-icon">📁</span> ${node.name}
          </summary>
          <ul class="directory-children">
      `
      // Sort children to show directories first, then files
      const sortedChildren = [...node.children].sort((a, b) => {
        if (a.type !== b.type) return a.type === 'directory' ? -1 : 1 // Directories first
        return a.name.localeCompare(b.name, undefined, { numeric: true })
      })
      sortedChildren.forEach(child => html += buildTreeHTML(child, level + 1))
      html += `</ul></details></li>`
      return html
    }
  }

  // Build the tree HTML starting from root's children (skip the root node itself)
  let treeHTML = ''
  if (fileTree.children && fileTree.children.length > 0) {
    const sortedRootChildren = [...fileTree.children].sort((a, b) => {
      if (a.type !== b.type) return a.type === 'directory' ? -1 : 1 // Directories first
      return a.name.localeCompare(b.name, undefined, { numeric: true })
    })
    treeHTML = sortedRootChildren.map(child => buildTreeHTML(child, 0)).join('')
  }

  // Also create flat list view option (can be toggled with CSS)
  let flatList = files.map((file) =>
    `<li><a href="/${baseRoute}/view/${encodeURIComponent(file.relativePath)}">${file.relativePath || file.name}</a></li>`
  ).join('')

  let htmlContent = `
    <div class='markdown-list-container'>
      <h1>Markdown Files</h1>
      <div class="view-toggle mb-3">
        <button class="btn btn-sm btn-outline-primary active" onclick="showTreeView()">Tree View</button>
        <button class="btn btn-sm btn-outline-primary" onclick="showFlatView()">Flat View</button>
      </div>
      <div id="treeView" class="tree-view">
        ${files.length === 0
      ? '<p>No markdown files found.</p>'
      : `<ul class="tree-list">${treeHTML}</ul>`
    }
      </div>
      <div id="flatView" class="flat-view" style="display: none;">
        ${files.length === 0
      ? '<p>No markdown files found.</p>'
      : `<ul class="flat-list">${flatList}</ul>`
    }
      </div>
    </div>
  `

  let htmlTemplate = CreateBaseHtml(htmlPageTitle.fileViwer, htmlContent)
  res.send(htmlTemplate)
}

// /* Plain one single folder */
// async function GetMarkdownList(req, res) {
//   const { files, ROOT_DIR } = await readFiles(req.params.folderPath)
//   let list = files.map((file) => `<li><a href="/${baseRoute}/view/${encodeURIComponent(file)}">${file}</a></li>`).join('')
//   list += `<li><a href="/${baseRoute}/view/overall">Overall (Live)</a></li>`
//   let htmlContent = `
//   <div class='markdown-list-container'>
//     <h1>Markdown Files</h1>
//     ${files.length === 0 ? '<p>No markdown files found.</p>' : `<ul>${list}</ul>`}
//     <!-- <button id="createOverallBtn" class="btn btn-primary mt-3">Create Overall File</button> -->
//   </div>`
//   let hmtlTemplate = CreateBaseHtml(htmlPageTitle.fileViwer, htmlContent)
//   res.send(hmtlTemplate)
// }

// View markdown file
async function GetMarkdownFile(req, res) {
  const { files, ROOT_DIR } = await readFiles(req.params.folderPath)
  const fileName = req.params.file
  if (fileName.toLowerCase() === htmlPageTitle.overAll.toLowerCase()) {
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
    let hmtlTemplate = CreateBaseHtml(htmlPageTitle.overAll, htmlContent)

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

async function SetMarkdownPath(req, res) {
  const { path: newPath } = req.body
  if (!newPath) return res.status(400).send({ success: false, message: 'Path is required' })
  try {
    process.env.MARKDOWN_DIR_PATH = newPath
    console.log("MARKDOWN_DIR_PATH Updated");
    res.send({ success: true, message: `Markdown directory path updated to ${newPath}` })
  } catch (err) {
    res.status(500).send({ success: false, message: 'Error updating path' })
  }
}

// ----------------  DIVIDER  routes -----------------------------------
router.route('/').get(GetMarkdownList)
router.route('/view/:file').get(GetMarkdownFile)
router.route('/set-path').put(SetMarkdownPath)
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
  <!--  
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
  -->
  <style> ${fs.readFileSync(path.join(__dirname, '../../public/assets', 'fonts.css'))} </style>
  <style> ${fs.readFileSync(path.join(__dirname, '../../public/assets', 'bootstrap.min.css'))} </style>
  <style> ${fs.readFileSync(path.join(__dirname, '../../public/assets', 'github-markdown.min.css'))} </style>
  <style> ${fs.readFileSync(path.join(__dirname, '../../public/assets', 'vs2015.min.css'))} </style>

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
  <style>
    .tree-list, .directory-children {
      list-style: none;
      padding-left: 0;
    }
    
    .directory-item {
      margin: 4px 0;
    }
    
    .directory-summary {
      cursor: pointer;
      padding: 4px 8px;
      background-color: #f5f5f5;
      border-radius: 4px;
      display: inline-block;
      min-width: 200px;
    }
    
    .directory-summary:hover {
      background-color: #e9e9e9;
    }
    
    .folder-icon {
      margin-right: 5px;
    }
    
    .file-item {
      margin: 2px 0;
      padding: 2px 8px;
    }
    
    .file-item a {
      text-decoration: none;
      color: #0366d6;
    }
    
    .file-item a:hover {
      text-decoration: underline;
    }
    
    .directory-children {
      margin-top: 5px;
    }
    
    .view-toggle {
      margin-bottom: 20px;
    }
    
    .view-toggle .btn {
      margin-right: 5px;
    }
    
    .flat-list {
      list-style: none;
      padding-left: 0;
    }
    
    .flat-list li {
      padding: 2px 0;
    }
    
    .flat-list a {
      text-decoration: none;
      color: #0366d6;
    }
    
    .flat-list a:hover {
      text-decoration: underline;
    }
  </style>
`

const globalScripts = ` 
  <!--  
  <script
    src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.3/js/bootstrap.bundle.min.js"
    integrity="sha512-7Pi/otdlbbCR+LnW+F7PwFcSDJOuUJB3OxtEHbg4vSMvzvJjde4Po1v4BR9Gdc9aXNUNFVUY+SK51wWT8WF0Gg=="
    crossorigin="anonymous"
    referrerpolicy="no-referrer"
  ></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/highlight.min.js"></script>
  -->

  <script> ${fs.readFileSync(path.join(__dirname, '../../public/assets', 'bootstrap.bundle.min.js'))} </script>
  <script> ${fs.readFileSync(path.join(__dirname, '../../public/assets', 'highlight.min.js'))} </script>

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

  <script>
    const setPathBtn = document.getElementById('setPathBtn')
    if(setPathBtn) {
      setPathBtn.addEventListener('click', () => {
        const setPathBtnInput = document.getElementById('setPathBtnInput')
        fetch('${baseRoute}/set-path', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            path: setPathBtnInput.value,
          })
        })
          .then(res => res.json())
          .then(data => console.log(data))
          .then(data => window.location.reload())
          .catch(err => console.error(err));
      })
    }
  </script>

  <script>
    function showTreeView() {
      document.getElementById('treeView').style.display = 'block';
      document.getElementById('flatView').style.display = 'none';
      document.querySelectorAll('.view-toggle .btn').forEach(btn => btn.classList.remove('active'));
      document.querySelector('.view-toggle .btn:first-child').classList.add('active');
    }
    
    function showFlatView() {
      document.getElementById('treeView').style.display = 'none';
      document.getElementById('flatView').style.display = 'block';
      document.querySelectorAll('.view-toggle .btn').forEach(btn => btn.classList.remove('active'));
      document.querySelector('.view-toggle .btn:last-child').classList.add('active');
    }
  </script>
`



const navbar = (fileName = '') => `
  <nav class="navbar navbar-expand-lg bg-body-tertiary">
    <div class="container-fluid">
      <a class="navbar-brand" href="/${baseRoute}">Home</a>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav">
        ${fileName !== htmlPageTitle.fileViwer ?
    `<li class="nav-item"><a class="nav-link" href="#" onclick="history.back()">Back</a></li>` :
    ''}
          <li class="nav-item">
            <a class="nav-link" href="#">${fileName.split('.')[0].toUpperCase().split('\\').at(-1)}</a>
          </li>
        </ul>
      </div>
    </div>
  </nav>
`

const htmlInputForBase = () => `
  <div class="container d-flex flex-column gap-3 pt-3">
    <div class="w-100">
      <label for="setPathBtnInput">Password</label>
      <input type="text" class="form-control" id="setPathBtnInput" placeholder="Directory Path" value="${process.env.MARKDOWN_DIR_PATH}">
    </div>
    <div class="d-flex justify-content-end">
      <button type="submit" class="btn btn-primary mb-3" id="setPathBtn" >SUBMIT</button>
    </div>
  </div>
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
      ${pageTitle.toLowerCase() === htmlPageTitle.fileViwer.toLowerCase() ? htmlInputForBase() : ""}
      <div class="container py-3">${content}</div>
      <button id="goTopBtn" aria-label="Go to top">↑</button>
      ${globalScripts}
      ${scripts}
  </body>
  </html>
`
}
