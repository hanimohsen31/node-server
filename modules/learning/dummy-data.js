const express = require('express')
const router = express.Router()
const ErrorHandler = require('../../utils/ErrorHandler')
const { v4: uuid } = require("uuid");

// const path = require('path')
// const fs = require('fs')

// --------------------------  DIVIDER  posts ---------------------------------------------------------------
// get by id
async function GetDummyData(req, res) {
  const defaultKays = [
    { name: "id", type: "string", },
    { name: "name", type: "string", },
    { name: "email", type: "email", },
    { name: "isActive", type: "boolean", },
    { name: "points", type: "number", },
    { name: "createdAt", type: "date", },
  ]

  const getRandomNumber = (min = 1, max = 1000) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

  const getRandomString = (length = 8) => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const getRandomEmail = () =>
    `${getRandomString(5)}@${getRandomString(5).toLowerCase()}.com`;

  const getRandomBoolean = () => Math.random() < 0.5;

  const getRandomDate = (start = new Date(2020, 0, 1), end = new Date()) =>
    new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

  try {
    const limit = req.query.limit || 100
    const keys = req.query.keys || defaultKays
    const dummyData = [];

    for (let i = 0; i < limit; i++) {
      const obj = {};
      keys.forEach(field => {
        switch (field.type) {
          case "number":
            obj[field.name] = getRandomNumber();
            break;
          case "string":
            if (['id', 'userId', 'rowId', 'objectId'].map(elm => elm.toLowerCase()).includes(field.name.toLowerCase())) obj[field.name] = uuid();
            else obj[field.name] = getRandomString();
            break;
          case "email":
            obj[field.name] = getRandomEmail();
            break;
          case "boolean":
            obj[field.name] = getRandomBoolean();
            break;
          case "date":
            obj[field.name] = getRandomDate();
            break;
          default:
            obj[field.name] = null;
        }
      });
      dummyData.push(obj);
    }

    res.status(200).json({ message: 'success', data: dummyData })
  } catch (err) {
    ErrorHandler(res, err, 'Error in Getting Data', 418, 'gpsts2')
  }
}


// --------------------------  DIVIDER  apis ----------------------------------------------------------------
router.route('').get(GetDummyData)
module.exports = router
