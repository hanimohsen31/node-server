// components
const { DirInputComponent } = require('./dir-input')
const { navbar } = require('./navbar')
// utils
const { globalSyles } = require('./styles')
const { globalScripts } = require('./scripts')
//   <!-- ${navbar(pageTitle)} -->

function CreateBaseHtml(htmlPageConstants, pageTitle = '', content = '', scripts = '', sidebar = '') {
    return `
  <!doctype html>
  <html lang="en">
  <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=yes" />
      <title>${pageTitle}</title>
      ${globalSyles}
  </head>
  <body>
      <div class='wrapper d-flex'>
      <div class='sidebar-filler'></div>
      <div class='sidebar'>${sidebar}</div>
        <!-- ${pageTitle.toLowerCase() === htmlPageConstants.fileViwer.toLowerCase() ? DirInputComponent() : ""} -->
        <div class="container py-3">${content}</div>
      </div>
      <button id="goTopBtn" aria-label="Go to top">↑</button>
      ${globalScripts(htmlPageConstants)}
      ${scripts}
  </body>
  </html>
  `;
}

// export default CreateBaseHtml
module.exports = { CreateBaseHtml }