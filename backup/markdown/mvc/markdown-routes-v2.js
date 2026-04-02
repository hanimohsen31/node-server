// ----------------  DIVIDER  imports -------------------------------------------------------------
const express = require('express')
const router = express.Router()
const fs = require('fs')
const path = require('path')
const htmlPageConstants = { overAll: 'Overall', fileViwer: 'File Viewer', baseRoute: 'markdown' }
// components
const { CreateBaseHtml } = require('./components/base')
const { MarkdownTreeComponent } = require('./components/markdown-tree')
const { MarkdownViewComponent } = require('./components/view')
// utils
const { readFilesRecursive } = require('./utils/reading-dir')

// ----------------  DIVIDER  apis ----------------------------------------------------------------
// Home – list markdown files with folder tree structure
async function MarkdownView(req, res) {
  const { fileTree, ROOT_DIR, files } = await readFilesRecursive(req.params.folderPath)
  const fileName = req.params.file
  if (!fileName) {
    let pageName = htmlPageConstants.fileViwer
    let sidebarContent = await MarkdownTreeComponent(fileTree, ROOT_DIR, files, htmlPageConstants.baseRoute)
    let hmtlTemplate = CreateBaseHtml(htmlPageConstants, pageName, 'Please Select File', sidebarContent)
    res.send(hmtlTemplate)
  } else {
    let pageName = fileName.toLowerCase() === htmlPageConstants.overAll.toLowerCase() ? htmlPageConstants.overAll : fileName
    let sidebarContent = await MarkdownTreeComponent(fileTree, ROOT_DIR, files, htmlPageConstants.baseRoute)
    let markdownContent = await MarkdownViewComponent(htmlPageConstants, files, ROOT_DIR, fileName)
    let hmtlTemplate = CreateBaseHtml(htmlPageConstants, pageName, markdownContent, sidebarContent)
    res.send(hmtlTemplate)
  }
}

// Create overall.md file combining all markdown files
async function CreateOverall(req, res) {
  const { files, ROOT_DIR } = await readFilesRecursive(req.params.folderPath)
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
router.route('/').get(MarkdownView)
router.route('/view/:file').get(MarkdownView)
router.route('/set-path').put(SetMarkdownPath)
router.route('/create-overall').post(CreateOverall)
module.exports = router
