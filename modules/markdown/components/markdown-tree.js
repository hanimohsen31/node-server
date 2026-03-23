const path = require('path')

// Home – list markdown files with folder tree structure
async function MarkdownTreeComponent(fileTree, ROOT_DIR, files, baseRoute) {
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
  return htmlContent
}

// /* Plain one single folder */
async function MarkdownFlatComponent(files, ROOT_DIR, baseRoute) {
  let list = files.map((file) => {
    const relativePath = path.relative(ROOT_DIR, file.path)
    return `<li><a href="/${baseRoute}/view/${encodeURIComponent(relativePath)}">${file.name}</a></li>`
  }
  ).join('')
  list += `<li><a href="/${baseRoute}/view/overall">Overall (Live)</a></li>`
  let htmlContent = `
  <div class='markdown-list-container'>
    <h1>Markdown Files</h1>
    ${files.length === 0 ? '<p>No markdown files found.</p>' : `<ul>${list}</ul>`}
    <!-- <button id="createOverallBtn" class="btn btn-primary mt-3">Create Overall File</button> -->
  </div>`
  return htmlContent
}

module.exports = { MarkdownTreeComponent, MarkdownFlatComponent }