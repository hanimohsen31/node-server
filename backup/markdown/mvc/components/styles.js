const fs = require('fs')
const path = require('path')

const highlight = {
  dark: `https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/styles/vs2015.min.css`,
  monokai: `https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/styles/monokai.min.css`,
  // solarizedLight: `https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/styles/solarized-light.min.css`,
  atomOneDark: `https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/styles/atom-one-dark.min.css`,
  // dracula: `https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/styles/dracula.min.css`,
}
/**
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
    <style> ${fs.readFileSync(path.join(__dirname, '../../../public/assets', 'bootstrap.min.css'))} </style>
  -->
 */

const globalSyles = `
  <style> ${fs.readFileSync(path.join(__dirname, '../../../public/assets', 'fonts.css'))} </style>
  <style> ${fs.readFileSync(path.join(__dirname, '../../../public/assets', 'github-markdown.min.css'))} </style>
  <style> ${fs.readFileSync(path.join(__dirname, '../../../public/assets', 'vs2015.min.css'))} </style>
  <style> ${fs.readFileSync(path.join(__dirname, 'styles.css'))} </style>
`
module.exports = { globalSyles }