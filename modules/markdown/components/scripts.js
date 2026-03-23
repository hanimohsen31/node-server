const fs = require('fs')
const path = require('path')
/*
  <!--  
  <script
    src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.3/js/bootstrap.bundle.min.js"
    integrity="sha512-7Pi/otdlbbCR+LnW+F7PwFcSDJOuUJB3OxtEHbg4vSMvzvJjde4Po1v4BR9Gdc9aXNUNFVUY+SK51wWT8WF0Gg=="
    crossorigin="anonymous"
    referrerpolicy="no-referrer"
  ></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/highlight.min.js"></script>
  <script> ${fs.readFileSync(path.join(__dirname, '../../../public/assets', 'bootstrap.bundle.min.js'))} </script>
  -->
 */
const globalScripts = (htmlPageConstants) => ` 
  <script> ${fs.readFileSync(path.join(__dirname, '../../../public/assets', 'highlight.min.js'))} </script>
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
        fetch('${''}/set-path', {
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
module.exports = { globalScripts }