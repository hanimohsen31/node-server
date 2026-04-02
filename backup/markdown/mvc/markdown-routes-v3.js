// ----------------  DIVIDER  imports -------------------------------------------------------------
const express = require('express')
const router = express.Router()
const fs = require('fs')
const hljs = require('highlight.js')
const MarkdownIt = require('markdown-it')
const { readFilesRecursive } = require('./utils/reading-dir')
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

// ----------------  DIVIDER  apis ----------------------------------------------------------------
async function GetMarkdownList(req, res) {
  try {
    const { fileTree, ROOT_DIR, files } = await readFilesRecursive(req.params.folderPath)
    const normalizedFiles = files.map(file => ({
      name: file.name,
      relativePath: file.relativePath,
      fullPath: file.path
    }))
    res.json({
      success: true,
      root: ROOT_DIR,
      list: normalizedFiles,
      tree: fileTree,
      count: normalizedFiles.length
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: 'Failed to load markdown files',
      error: error.message
    })
  }
}

async function GetMarkdownFile(req, res) {
  const fileName = req.body.name
  const filePath = req.body.path
  if (!fileName.endsWith('.md') || !fs.existsSync(filePath)) return res.status(400).send('File not found')
  const markdown = fs.readFileSync(filePath, 'utf-8')
  let htmlContent = md.render(markdown)
  res.status(200).send(htmlContent)
}

async function SetMarkdownPath(req, res) {
  const { path: newPath } = req.body
  if (!newPath) return res.status(200).json({ success: false, message: 'Path is required' })
  try {
    process.env.MARKDOWN_DIR_PATH = newPath
    console.log("MARKDOWN_DIR_PATH Updated");
    res.status(200).json({ success: true, message: `Markdown directory path updated to ${newPath}` })
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error updating path' })
  }
}

// ----------------  DIVIDER  routes -----------------------------------
router.route('/').get(GetMarkdownList)
router.route('/view').post(GetMarkdownFile)
router.route('/set-path').put(SetMarkdownPath)
module.exports = router

// ----------------  DIVIDER  utils -----------------------------------
