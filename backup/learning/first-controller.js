const express = require("express");
const router = express.Router();
let id = null;

// middlewhere only runs on param id
router.param("id", (req, res, next, val) => {
  // console.log("id", req.params.id);
  id = req.params.id;
  next();
});

// middlewhere function
function checkPrice(req, res, next) {
  let price = req.body.price;
  // console.log(req.body);
  if (!price) {
    return res.status(418).send({
      message: "price not found",
    });
  }
  next();
}

// function shape 1
function FN1(req, res) {
  res.status(200).json({ message: "First FN1" });
}

function FN2(req, res) {
  // console.log(req.body);
  res.status(200).json({ message: "First FN2", data: id ? id : null });
}

router.route("").get(FN1);
router.route("/price").post(checkPrice, FN2);
router.route("/userid/:id").get(FN2);
module.exports = router;
