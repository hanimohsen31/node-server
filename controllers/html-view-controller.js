const express = require("express");
const fs = require('fs')
const router = express.Router();

let path =`${__dirname}/public/overviview.html`

// function shape 1
function GetRoot(req, res) {
  res.status(200).json({ message: "Root Get Method" });
}

router.route("fs1").get(GetRoot)

module.exports = router;
