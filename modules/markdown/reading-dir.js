const fs = require('fs')
const path = require('path')

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
async function readFilesRecursive(folderPath = process.env.MARKDOWN_DIR_PATH) {
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
                    .map(file => ({ name: file.name, path: path.join(currentPath, file.name), type: 'file' }))
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
            fileTree: { name: 'error', path: '', type: 'directory', children: [] },
            ROOT_DIR
        }
    }
}

module.exports = { readSingleDirFiles, readFilesRecursive }