const navbar = (fileName = '') => `
  <nav class="navbar navbar-expand-lg bg-body-tertiary">
    <div class="container-fluid">
      <a class="navbar-brand" href="/${''}">Home</a>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav">
          <li class="nav-item"><a class="nav-link" href="#" onclick="history.back()">Back</a></li>
          <li class="nav-item">
            <a class="nav-link" href="#">${fileName.split('.')[0].toUpperCase().split('\\').at(-1)}</a>
          </li>
        </ul>
      </div>
    </div>
  </nav>
`
module.exports = { navbar }