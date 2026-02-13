const express = require('express')
const router = express.Router()
const fs = require('fs')
const path = require('path')
const { ScrapAmazonData } = require('./scrapper')
const { v4: uuid } = require("uuid");
const {
  parseCSV,
  parseXLSX,
  parseChart,
  findKeywordCSV,
  findXrayKeywordCSV,
  fileExists,
  parseSeachExpander,
  parseXrayHtml,
  extractAmazonProductsGPT,
} = require('./new-parser')
// database
const GenericSchema = require('../../../utils/GenericShema')
const mongoose = require('mongoose')
const { url } = require('inspector')
const AmazonResult = mongoose.model('AmazonResult', GenericSchema())

// --------------------------  DIVIDER  routs ---------------------------------------------------------------
// /* STEP 3 - start the automation cycle */
async function StartSearchOnAmazon(req, res) {
  console.log(req.body);
  let { proudcts, searchId, outputDir, sliceLimitStart, sliceLimitEnd } = req.body // proudcts: string[]
  if (!proudcts || !proudcts?.length || !Array.isArray(proudcts)) return res.status(400).json({ message: 'keywords Empty', data: null })
  proudcts = proudcts.map((item) => item.replace(/\//g, '\\/').trim())
  proudcts = [...new Set(proudcts)].filter(Boolean)
  if (!searchId) searchId = Date.now()
  if (!outputDir) outputDir = 'D:/Projects/Amazon/Store/AmazonScrapping'
  if (!sliceLimitStart) sliceLimitStart = 0
  if (!sliceLimitEnd) sliceLimitEnd = proudcts.length
  proudcts = proudcts.slice(sliceLimitStart, sliceLimitEnd)
  // save in downloads folder
  outputDir = path.join(outputDir, `StartSearchOnAmazon${Date.now()}`)
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true })
  try {
    console.log('🚀 Scrapping Started for:', proudcts.length, 'product')
    await ScrapAmazonData(proudcts, outputDir)
    console.log('✅ Scrapping Success')
  } catch (err) {
    console.log(err)
    res.status(400).json({ message: 'Scrapping Error', data: null, error: err })
  }
  try {
    const data = { fileOutputsLocation: outputDir.toString().split('/').at(-1), searchId }
    await AmazonResult.create(data)
    res.status(200).json({ message: 'success', data: null })
  } catch (err) {
    console.log(err)
    res.status(400).json({ message: 'Path Saving Error', data: null, error: err })
  }
}

// /* STEP 4 - get saved results */
async function GetAllSearches(req, res) {
  try {
    const result = await AmazonResult.find()
    const searchesArray = [...new Set(result.map((item) => item.searchId))].filter((elm) => elm !== null)
    res.status(200).json({ message: 'Posts', data: searchesArray })
  } catch (err) {
    console.log(err)
    res.status(400).json({ message: 'Error Happened', data: null, error: err })
  }
}

async function GetProductsListOnly(req, res) {
  let outputDir = 'D:/Projects/Amazon/Store/AmazonScrapping/StartSearchOnAmazon1770742380155'

  // get subfolders (each keyword)
  const dirs = fs.readdirSync(outputDir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(elm => elm.name)
  // .map(d => path.join(outputDir, d.name));

  try {
    res.status(200).json({ message: 'success', data: dirs })
  } catch (err) {
    console.log(err)
    res.status(400).json({ message: 'Error Happened', data: null, error: err })
  }
}

async function GetProductByName(req, res) {
  let outputDir = 'D:/Projects/Amazon/Store/AmazonScrapping/StartSearchOnAmazon1770742380155'
  const KEYWORD = req.params.dir
  const dir = path.join(outputDir, KEYWORD)
  let overAllHTML = path.join(outputDir, KEYWORD, 'items_list.html')

  const result = {
    id: uuid(),
    title: KEYWORD,
    searchVolume: 0,
    STEP1_SearchExpanderTable: [],
    STEP2_productsAnalysisXrayTable: [],
    STEP3_xrayKeywordTable: [],
    amazonProdcutsList: [],
    chartData: []
  };

  // /* SEARCH EXPANDER TABLE STEP 1 IN SCRAPPING */
  const expCSV = findKeywordCSV(KEYWORD, dir);
  const expHTML = path.join(dir, `${KEYWORD}_h10-search-expander.html`);
  // console.log(expHTML);
  if (expCSV) result.STEP1_SearchExpanderTable = await parseCSV(path.join(dir, expCSV));
  else if (fs.existsSync(expHTML)) {
    try {
      result.STEP1_SearchExpanderTable = parseSeachExpander(expHTML);
    } catch {
      result.STEP1_SearchExpanderTable = parseSeachExpander(overAllHTML);
    }
  }
  result.STEP1_SearchExpanderTable = result.STEP1_SearchExpanderTable.map(elm => ({ ...elm, id: uuid() }));

  // /* CHART STEP 2A */
  const chartPath = path.join(dir, "chart.csv");
  if (fileExists(chartPath)) {
    const chart = await parseChart(chartPath);
    result.searchVolume = chart.lastVolume;
    result.chartData = chart.chartData;
  }

  // /* PRODUCT XRAY TABLE STEP 2B IN SCRAPPING */
  const xrayXLSXPath = path.join(dir, "Helium_10_Xray_.xlsx");
  const xrayHTML2 = path.join(dir, `${KEYWORD}_h10-xray.html`);
  if (fs.existsSync(xrayXLSXPath)) result.STEP2_productsAnalysisXrayTable = await parseXLSX(xrayXLSXPath);
  else if (fs.existsSync(xrayHTML2)) {
    try {
      result.STEP2_productsAnalysisXrayTable = parseXrayHtml(xrayHTML2);
    } catch {
      result.STEP2_productsAnalysisXrayTable = parseXrayHtml(overAllHTML);
    }
  }
  // console.log(Array.isArray(result.STEP2_productsAnalysisXrayTable));
  result.STEP2_productsAnalysisXrayTable = result.STEP2_productsAnalysisXrayTable?.map((elm) => {
    return {
      id: uuid(),
      imageBase64: elm.imageBase64,
      product: elm["Product Details"],
      links: `Image: ${elm["Image URL"]?.text || elm["Image URL"]?.hyperlink || "__"}\nPRoduct: ${elm["URL"]?.text || elm["URL"]?.hyperlink || "__"}`,
      price: elm["Price"],
      BSR: elm["BSR"],
      imagesNumebr: elm["Images"],
      info: `Seller: ${elm["Seller"]}\nASIN: ${elm["ASIN"]}\nBrand: ${elm["Brand"]}\nSponsored: ${elm["Sponsored"]}\nCountry: ${elm["Seller Country/Region"]}`,
    }
  });

  /* XRAY KEYWORDS TABLE STEP 3 IN SCRAPPING */
  const xrayCSV = findXrayKeywordCSV(dir);
  const xrayHTML = path.join(dir, `${KEYWORD}_h10-xray-keywords.html`);
  if (xrayCSV) result.STEP3_xrayKeywordTable = await parseCSV(path.join(dir, xrayCSV));
  else if (fs.existsSync(xrayHTML)) {
    try {
      result.STEP3_xrayKeywordTable = parseSeachExpander(xrayHTML);
    }
    catch {
      result.STEP3_xrayKeywordTable = parseSeachExpander(overAllHTML);
    }
  }

  result.STEP3_xrayKeywordTable = result.STEP3_xrayKeywordTable.map(elm => ({ ...elm, id: uuid() }));

  // step 4 extract items list from html
  if (fs.existsSync(overAllHTML)) {
    result.amazonProdcutsList = await extractAmazonProductsGPT(overAllHTML);
    result.amazonProdcutsList = result.amazonProdcutsList.filter((item) => item.title !== null).map(elm => ({ ...elm, id: uuid() }));
  }

  result.id = uuid();
  // read image and convert to base64
  const imageBuffer = fs.readFileSync(path.join(dir, "items_list.jpg"));
  const base64Image = imageBuffer.toString('base64');

  // optional: add mime type prefix (recommended for frontend)
  result.snapshot = `data:image/png;base64,${base64Image}`;
  result.iframe = `https://www.amazon.com/s?k=${encodeURIComponent(KEYWORD).replace(/%20/g, '+')}`
  result.pinterest = `https://www.pinterest.com/search/pins/?q=${KEYWORD}`

  try {
    res.status(200).json({ message: 'success', data: result })
  } catch (err) {
    console.log(err)
    res.status(400).json({ message: 'Error Happened', data: null, error: err })
  }
}

// /* STEP 4 - get Scrapping Results by searchId */
async function GetProductsResults(req, res) {
  let outputDir = 'D:/Projects/Amazon/Store/AmazonScrapping/StartSearchOnAmazon1770742380155'

  // get subfolders (each keyword)
  const dirs = fs.readdirSync(outputDir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => path.join(outputDir, d.name));
  let finalResultData = []

  for (const dir of dirs) {
    const KEYWORD = path.basename(dir);
    let overAllHTML = path.join(outputDir, KEYWORD, 'items_list.html')
    console.log(overAllHTML);

    const result = {
      id: uuid(),
      title: KEYWORD,
      searchVolume: 0,
      STEP1_SearchExpanderTable: [],
      STEP2_productsAnalysisXrayTable: [],
      STEP3_xrayKeywordTable: [],
      amazonProdcutsList: [],
      chartData: []
    };

    // /* SEARCH EXPANDER TABLE STEP 1 IN SCRAPPING */
    const expCSV = findKeywordCSV(KEYWORD, dir);
    const expHTML = path.join(dir, `${KEYWORD}_h10-search-expander.html`);
    // console.log(expHTML);
    if (expCSV) result.STEP1_SearchExpanderTable = await parseCSV(path.join(dir, expCSV));
    else if (fs.existsSync(expHTML)) {
      try {
        result.STEP1_SearchExpanderTable = parseSeachExpander(expHTML);
      } catch {
        result.STEP1_SearchExpanderTable = parseSeachExpander(overAllHTML);

      }
    }

    // /* CHART STEP 2A */
    const chartPath = path.join(dir, "chart.csv");
    if (fileExists(chartPath)) {
      const chart = await parseChart(chartPath);
      result.searchVolume = chart.lastVolume;
      result.chartData = chart.chartData;
    }

    // /* PRODUCT XRAY TABLE STEP 2B IN SCRAPPING */
    const xrayXLSXPath = path.join(dir, "Helium_10_Xray_.xlsx");
    const xrayHTML2 = path.join(dir, `${KEYWORD}_h10-xray.html`);
    if (fs.existsSync(xrayXLSXPath)) result.STEP2_productsAnalysisXrayTable = await parseXLSX(xrayXLSXPath);
    else if (fs.existsSync(xrayHTML2)) {
      try {
        result.STEP2_productsAnalysisXrayTable = parseXrayHtml(xrayHTML2);
      } catch {
        result.STEP2_productsAnalysisXrayTable = parseXrayHtml(overAllHTML);
      }
    }

    /* XRAY KEYWORDS TABLE STEP 3 IN SCRAPPING */
    const xrayCSV = findXrayKeywordCSV(dir);
    const xrayHTML = path.join(dir, `${KEYWORD}_h10-xray-keywords.html`);
    if (xrayCSV) result.STEP3_xrayKeywordTable = await parseCSV(path.join(dir, xrayCSV));
    else if (fs.existsSync(xrayHTML)) {
      try {
        result.STEP3_xrayKeywordTable = parseSeachExpander(xrayHTML);
      }
      catch {
        result.STEP3_xrayKeywordTable = parseSeachExpander(overAllHTML);
      }
    }

    // step 4 extract items list from html
    if (fs.existsSync(overAllHTML)) {
      result.amazonProdcutsList = await extractAmazonProductsGPT(overAllHTML);
      result.amazonProdcutsList = result.amazonProdcutsList.filter((item) => item.title !== null);
    }

    res.id = uuid();
    finalResultData.push(result);
  }

  try {
    res.status(200).json({ message: 'success', data: finalResultData })
  } catch (err) {
    console.log(err)
    res.status(400).json({ message: 'Error Happened', data: null, error: err })
  }
}

// --------------------------  DIVIDER  apis ----------------------------------------------------------------
router.route('/').post(StartSearchOnAmazon).get(GetAllSearches)
// router.route('/scrapping').get(GetProductsResults)
router.route('/prodcutsList').get(GetProductsListOnly)
router.route('/scrapping/:dir').get(GetProductByName)
module.exports = router
