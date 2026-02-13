function CreateBaseHtml() {
  return `
<!doctype html>
    <html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>BIND_TITLE</title>
        ${globalSyles}
        BIND_CSS
    </head>
    <body>
        ${navbar}
        <div class="container py-3">BIND_CONTENT</div>
        <button id="goTopBtn" aria-label="Go to top">↑</button>

        ${globalScripts}
        BIND_JS
    </body>
    </html>
`
}

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
      const goTopBtn = document.getElementById('goTopBtn')
      window.addEventListener('scroll', () => {
        if(window.scrollY > 300){
          goTopBtn.style.display = 'block'
        }else{
          goTopBtn.style.display = 'hidden'
        }
      })
      goTopBtn.addEventListener('click', () => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth',
        })
      })
    </script>
`

const navbar = `
    <nav class="navbar navbar-expand-lg bg-body-tertiary">
        <div class="container-fluid">
            <a class="navbar-brand" href="/">Home</a>
            <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav">
                <li class="nav-item">
                <a class="nav-link" href="http://127.0.0.1:3000/markdown">Markdown</a>
                </li>
            </ul>
            </div>
        </div>
    </nav>
`

module.exports = CreateBaseHtml
