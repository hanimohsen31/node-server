const express = require("express");
const router = express.Router();

// function shape 1
function GetRoot(req, res) {
  res.status(200).json({ message: "Root Get Method" });
}

function PostRoot(req, res) {
  res.status(200).json({ message: "Root Post Method" });
}

// function shape 2
const GR2 = function gr2(request, response) {
  response.status(200).json({ message: "GR2" });
};

// function shape 3
const GR3 = (request, response) => {
  response.status(200).json({ message: "GR3" });
};

router.route("fs1").get(GetRoot).post(PostRoot);
router.route("fs2").get(GR2)
router.route("fs3").get(GR3)
module.exports = router;
