const express = require('express')
const router = express.Router()

// function shape 1
function GetRoot(req, res) {
  res.status(200).json({ message: 'Server Works - Method: "GET"' })
}

function PostRoot(req, res) {
  res.status(200).json({ message: 'Server Works - Method: "Post"' })
}

// function shape 2
const PutRoot = function fnfs2(request, response) {
  response.status(200).json({ message: 'Server Works - Method: "Put"' })
}

// function shape 3
const PatchRoot = (request, response) => {
  response.status(200).json({ message: 'Server Works - Method: "Patch"' })
}

router.route('').get(GetRoot).post(PostRoot).put(PutRoot).patch(PatchRoot)
module.exports = router
