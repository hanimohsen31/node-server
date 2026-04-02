const fs = require('fs')
const path = require('path')
const hljs = require('highlight.js')
const MarkdownIt = require('markdown-it')
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

// View markdown file
async function MarkdownViewComponent(htmlPageConstants,files, ROOT_DIR, fileName) {
    // const { files, ROOT_DIR } = await readFiles(req.params.folderPath)
    // const fileName = req.params.file
    if (fileName.toLowerCase() === htmlPageConstants.overAll.toLowerCase()) {
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
        return htmlContent
        // let hmtlTemplate = CreateBaseHtml(htmlPageConstants.overAll, htmlContent)
        // res.send(hmtlTemplate)
    } else {
        const filePath = path.join(ROOT_DIR, fileName)
        // if (!fileName.endsWith('.md') || !fs.existsSync(filePath)) return res.status(404).send('File not found')
        const markdown = fs.readFileSync(filePath, 'utf-8')
        let htmlContent = md.render(markdown)
        htmlContent = `<div class='container markdown-body mx-auto bg-white text-black' dir="auto">${htmlContent}</div>`
        return htmlContent
        // let hmtlTemplate = CreateBaseHtml(fileName, htmlContent)
        // res.send(hmtlTemplate)
    }
}

module.exports = { MarkdownViewComponent }