const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const XLSX = require("xlsx");
const cheerio = require("cheerio");
const ExcelJS = require("exceljs");

async function parseCSV(filePath) {
    return new Promise((resolve, reject) => {
        const results = [];
        fs.createReadStream(filePath)
            .pipe(csv())
            .on("data", (data) => {
                const cleaned = {};
                for (let [key, value] of Object.entries(data)) {
                    // Remove BOM, quotes, and trim spaces
                    const cleanKey = key
                        .replace(/^\uFEFF/, "") // remove BOM
                        .replace(/^"+|"+$/g, "") // remove surrounding quotes
                        .trim();
                    const cleanValue = typeof value === "string" ? value.replace(/^"+|"+$/g, "").trim() : value;
                    cleaned[cleanKey] = cleanValue;
                }
                results.push(cleaned);
            })
            .on("end", () => resolve(results))
            .on("error", reject);
    });
}

/* XLSX parser */
async function parseXLSX(filePath) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    const worksheet = workbook.worksheets[0]; // first sheet
    const rows = [];
    // 1️⃣ Collect all images and sort by top-left row
    const imagesArray = [];
    worksheet.getImages().forEach((img) => {
        const { range, imageId } = img;
        const imgObj = workbook.getImage(imageId);
        const base64 = imgObj.buffer.toString("base64");
        const mime = imgObj.extension === "png" ? "image/png" : "image/jpeg";
        imagesArray.push({
            row: range.tl.nativeRow + 1,
            base64: `data:${mime};base64,${base64}`,
        });
    });
    // Sort top-to-bottom
    imagesArray.sort((a, b) => a.row - b.row);
    // 2️⃣ First row = headers
    const headerRow = worksheet.getRow(1);
    const headers = [];
    headerRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        headers.push(cell.value || `col${colNumber}`);
    });
    // 3️⃣ Map rows to headers + sequential images
    worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
        if (rowNumber === 1) return; // skip header row
        const obj = {};
        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
            const header = headers[colNumber - 1] || `col${colNumber}`;
            obj[header] = cell.value;
        });
        // sequential image
        obj.imageBase64 = imagesArray.length > 0 ? imagesArray.shift().base64 : null;
        rows.push(obj);
    });
    return rows;
}

/* HTML table parser with optional base64 images */
function parseHTMLTable(filePath) {
    const html = fs.readFileSync(filePath, "utf8");
    const $ = cheerio.load(html);

    const headers = [];
    $("table thead th").each((i, el) => {
        headers.push($(el).text().trim());
    });

    const rows = [];
    $("table tbody tr").each((i, row) => {
        const obj = {};
        $(row)
            .find("td")
            .each((j, cell) => {
                const img = $(cell).find("img").attr("src");

                if (img && img.startsWith("http")) {
                    obj[headers[j] || `col${j}`] = {
                        text: $(cell).text().trim(),
                        imageBase64: null, // optional: fetch and convert later
                        imageUrl: img
                    };
                } else {
                    obj[headers[j] || `col${j}`] = $(cell).text().trim();
                }
            });
        rows.push(obj);
    });

    return rows;
}

/* Chart CSV special handling */
async function parseChart(filePath) {
    const data = await parseCSV(filePath);
    const last = data[data.length - 1] || {};
    return {
        lastVolume: Number(last["Search Volume"] || 0),
        chartData: data
    };
}

function findKeywordCSV(keyword, dir) {
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(
        `^${escaped}-\\d{4}-\\d{2}-\\d{2}\\.csv$`,
        "i"
    );
    return fs.readdirSync(dir).find(file => regex.test(file));
}

function findXrayKeywordCSV(dir) {
    const regex = /^Xray_Keyword\d{4}-\d{2}-\d{2}\.csv$/i;
    return fs.readdirSync(dir).find(file => regex.test(file));
}

/* Simple synchronous check */
function fileExists(filePath) {
    return fs.existsSync(filePath);
}

// /* SEARCH EXPANDER TABLE STEP 1 IN SCRAPPING */
function parseSeachExpander(filepath) {
    // Load HTML (from file or string)
    const html = fs.readFileSync(filepath, "utf8");
    const $ = cheerio.load(html);
    // Output array
    const results = [];
    // Select the container for Amazon Suggestions
    $('div:has(span:contains("Amazon Suggestions"))')
        .find('ul > li')
        .each((i, li) => {
            const $li = $(li);
            // Keyword text
            const keyword = $li.find('a > span').first().text().trim() +
                $li.find('a').contents().filter((i, el) => el.type === 'text').text().trim();
            // Search volume (just number inside div after the button)
            const searchVolume = $li.find('div.sc-jEMkrx').next().text().trim();
            // Trend (arrow up/down)
            const trendSvg = $li.find('svg[data-icon="arrow-up-long"], svg[data-icon="arrow-down-long"]');
            let searchTrend = "-"; // default
            if (trendSvg.length > 0) searchTrend = trendSvg.attr('data-icon') === 'arrow-up-long' ? 'Positive' : 'Negative';
            // Hardcoded / placeholder values (replace if you can extract real data)
            const competingProducts = "4000";
            const titleDensity = "0";
            const keywordType = "Amazon Suggestions";
            results.push({
                Keyword: keyword,
                "Search Volume": searchVolume || "-",
                "Search Volume Trend": searchTrend,
                "Competing Products": competingProducts,
                "Title Density": titleDensity,
                "Keyword Type": keywordType
            });
        });
    return results;
}

// /* PRODUCT XRAY TABLE STEP 2 IN SCRAPPING */
function parseXrayHtml(filepath) {
    const html = fs.readFileSync(filepath, "utf8");
    const $ = cheerio.load(html);

    // ============ PART 1: PARSE SUMMARY STATISTICS ============
    const summaryStats = {
        "Search Volume": null,
        "Total Revenue": null,
        "Average Revenue": null,
        "Average Price": null,
        "Average BSR": null,
        "Average Reviews": null,
        "Avg. Title Char. Count": null,
        "Top 10 products with Revenue over $5,000": null,
        "Top 10 products with Under 75 reviews": null,
        "Total ASINs": null
    };

    // Extract main stats from the summary section
    $('.sc-dnXEjN .sc-kvbPio, .sc-dnXEjN .sc-fhYmPb').each((i, elem) => {
        const labelElement = $(elem).find('.sc-QIWCM, .sc-gaVime').first();
        const valueElement = $(elem).find('.sc-cvGzNy, .sc-iYyKuI').first();

        const label = labelElement.text().trim();
        let value = valueElement.text().trim();

        if (label.includes('Search Volume')) summaryStats['Search Volume'] = value;
        else if (label.includes('Total Revenue')) summaryStats['Total Revenue'] = value;
        else if (label.includes('Average Revenue')) summaryStats['Average Revenue'] = value;
        else if (label.includes('Average Price')) summaryStats['Average Price'] = value;
        else if (label.includes('Average BSR')) summaryStats['Average BSR'] = value;
        else if (label.includes('Average Reviews')) summaryStats['Average Reviews'] = value;
        else if (label.includes('Avg. Title Char')) summaryStats['Avg. Title Char. Count'] = value;
    });

    // Extract Top 10 products stats
    $('.sc-ftkbWc .sc-lawzl').each((i, elem) => {
        const label = $(elem).find('.sc-ilbyrL').text().trim();
        const value = $(elem).find('.sc-jdYtOO').text().trim();

        if (label.includes('Revenue over $5,000')) {
            summaryStats['Top 10 products with Revenue over $5,000'] = value;
        } else if (label.includes('Under 75 reviews')) {
            summaryStats['Top 10 products with Under 75 reviews'] = value;
        }
    });

    // Extract total ASINs count
    const asinsElement = $('div:contains("ASINs")').first();
    summaryStats['Total ASINs'] = asinsElement.text().trim();

    // Extract search term
    const searchTerm = $('.sc-iZzYEE').first().text().trim().replace(/"/g, '');

    // ============ PART 2: PARSE PRODUCT TABLE DATA ============
    const products = [];

    // Find all product rows - each row has data-testid="table-row"
    const productRows = $('div[data-testid="table-row"]');

    console.log(`Found ${productRows.length} product rows`);

    productRows.each((index, row) => {
        // Skip if this is a header row or doesn't have product data
        if ($(row).find('div[data-testid="table-cell-asin"]').length === 0) {
            return;
        }

        const product = createEmptyProduct();
        product["Display Order"] = (index + 1) + ".";

        // ----- Extract Product Title and Image -----
        const titleCell = $(row).find('div[data-testid="table-cell-title"]');
        const titleLink = titleCell.find('a.sc-giqjFA');
        const productImage = titleCell.find('img.sc-hNnMQm');

        product["Product Details"] = titleLink.text().trim();
        if (titleLink.attr('href')) {
            product["URL"] = {
                text: `https://www.amazon.com${titleLink.attr('href')}`,
                hyperlink: `https://www.amazon.com${titleLink.attr('href')}`
            };
        }

        if (productImage.attr('src')) {
            product["Image URL"] = {
                text: productImage.attr('src'),
                hyperlink: productImage.attr('src')
            };
        }

        // ----- Extract ASIN -----
        const asinCell = $(row).find('div[data-testid="table-cell-asin"] .sc-hYPwqu');
        product["ASIN"] = asinCell.text().trim();

        // ----- Extract Brand -----
        const brandCell = $(row).find('div[data-testid="table-cell-brand"] .sc-dbLCiw');
        product["Brand"] = brandCell.text().trim();
        product["Seller"] = brandCell.text().trim(); // Often same as Brand

        // ----- Extract Price -----
        const priceCell = $(row).find('div[data-testid="table-cell-price"] .sc-kbBZwA');
        let priceText = priceCell.text().trim();
        product["Price  $"] = priceText.replace('$', '').trim();

        // ----- Extract Recent Purchases -----
        const recentPurchasesCell = $(row).find('div[data-testid="table-cell-recentPurchases"]');
        product["Recent Purchases"] = recentPurchasesCell.text().trim().replace('+', '');

        // ----- Extract Parent Level Sales -----
        const parentSalesCell = $(row).find('div[data-testid="table-cell-estMonthlySales"] .sc-vUZIB');
        let parentSalesText = parentSalesCell.clone().children().remove().end().text().trim();
        product["Parent Level Sales"] = parentSalesText.replace(/,/g, '');

        // ----- Extract ASIN Sales -----
        const asinSalesCell = $(row).find('div[data-testid="table-cell-ASINSales"] .sc-vUZIB');
        let asinSalesText = asinSalesCell.clone().children().remove().end().text().trim();
        product["ASIN Sales"] = asinSalesText.replace(/,/g, '');

        // ----- Extract Parent Level Revenue -----
        const parentRevenueCell = $(row).find('div[data-testid="table-cell-estMonthlyRevenue"] .sc-kbBZwA');
        let parentRevenueText = parentRevenueCell.text().trim();
        product["Parent Level Revenue"] = parentRevenueText.replace('$', '').replace(/,/g, '');

        // ----- Extract ASIN Revenue -----
        const asinRevenueCell = $(row).find('div[data-testid="table-cell-ASINRevenue"] .sc-kbBZwA');
        let asinRevenueText = asinRevenueCell.text().trim();
        product["ASIN Revenue"] = asinRevenueText.replace('$', '').replace(/,/g, '');

        // ----- Extract Title Char. Count -----
        const titleCharCountCell = $(row).find('div[data-testid="table-cell-titleCharCount"]');
        product["Title Char. Count"] = titleCharCountCell.text().trim();

        // ----- Extract BSR -----
        const bsrCell = $(row).find('div[data-testid="table-cell-bsr"] .sc-pkpm');
        product["BSR"] = bsrCell.text().trim().replace('#', '');

        // ----- Extract Seller Country/Region -----
        const countryCell = $(row).find('div[data-testid="table-cell-country"] .sc-hEWBVw');
        product["Seller Country/Region"] = countryCell.text().trim();

        // ----- Extract Fees -----
        const feesCell = $(row).find('div[data-testid="table-cell-fbaFee"] .sc-kbBZwA');
        let feesText = feesCell.text().trim();
        if (feesText && feesText !== 'N/A') {
            product["Fees  $"] = feesText.replace('$', '');
        }

        // ----- Extract Active Sellers -----
        const activeSellersCell = $(row).find('div[data-testid="table-cell-sellersNumber"] .sc-jvvOGq');
        product["Active Sellers"] = activeSellersCell.text().trim();

        // ----- Extract Ratings -----
        const ratingCell = $(row).find('div[data-testid="table-cell-reviewsRating"] .sc-gvLUYL');
        product["Ratings"] = ratingCell.text().trim();

        // ----- Extract Review Count -----
        const reviewCountCell = $(row).find('div[data-testid="table-cell-reviewsNumber"] .sc-sRGru').first();
        let reviewText = reviewCountCell.text().trim();
        product["Review Count"] = reviewText.replace(/,/g, '');

        // ----- Extract Review velocity (monthly change) -----
        const reviewChangeCell = $(row).find('div[data-testid="table-cell-reviewsNumber"] .sc-sRGru').eq(1);
        let changeText = reviewChangeCell.text().trim();
        const match = changeText.match(/[+-]?\d+/);
        if (match) {
            product["Review velocity"] = match[0];
        }

        // ----- Extract Size Tier -----
        const sizeTierCell = $(row).find('div[data-testid="table-cell-sizeTier"]');
        let sizeTierText = sizeTierCell.text().trim();
        if (sizeTierText && sizeTierText !== 'N/A') {
            product["Size Tier"] = sizeTierText;
        }

        // ----- Extract Buy Box (Seller Name) -----
        const buyBoxCell = $(row).find('div[data-testid="table-cell-sellerName"] .sc-cTqXMr');
        product["Buy Box"] = buyBoxCell.text().trim();

        // ----- Extract Fulfillment -----
        const fulfillmentCell = $(row).find('div[data-testid="table-cell-sellerType"] .sc-hyUBPu');
        product["Fulfillment"] = fulfillmentCell.text().trim();

        // ----- Extract Dimensions -----
        const dimensionsCell = $(row).find('div[data-testid="table-cell-dimensionsVolume"] .sc-kZJjpB');
        product["Dimensions"] = dimensionsCell.text().trim();

        // ----- Extract Weight -----
        const weightCell = $(row).find('div[data-testid="table-cell-weight"] .sc-evPKyv');
        product["Weight"] = weightCell.text().trim().replace(' lb', '');

        // ----- Extract Creation Date -----
        const creationDateCell = $(row).find('div[data-testid="table-cell-listingDateBigInt"] .sc-eUCZcD');
        product["Creation Date"] = creationDateCell.text().trim();

        // ----- Extract Seller Age (mo) -----
        const sellerAgeCell = $(row).find('div[data-testid="table-cell-sellerAge"] .sc-idJQzE');
        product["Seller Age (mo)"] = sellerAgeCell.text().trim();

        // ----- Extract Category from BSR button -----
        const categoryButton = $(row).find('div[data-testid="table-cell-bsr"] .sc-ePzlA-D.ikNdqo');
        if (categoryButton.length) {
            product["Category"] = categoryButton.text().trim();
        }

        // ----- Check for Sponsored badge -----
        const sponsoredBadge = $(row).find('div:contains("Sponsored")');
        if (sponsoredBadge.length) {
            product["Sponsored"] = "Sponsored";
        }

        // ----- Check for Best Seller badge -----
        const bestSellerBadge = $(row).find('div[class*="BestSeller"], div:contains("Best Seller")');
        if (bestSellerBadge.length) {
            product["Best Seller"] = "Yes";
        }

        // ----- Extract ABA Most Clicked (from ABA badge) -----
        const abaBadge = $(row).find('.sc-jrrXlR.geGReo, .sc-jrrXlR:contains("ABA")');
        if (abaBadge.length) {
            product["ABA Most Clicked"] = abaBadge.text().trim();
        }

        // Only add if we have at least an ASIN
        if (product["ASIN"]) {
            products.push(product);
        }
    });

    // return {
    //     summaryStats,
    //     products,
    //     metadata: {
    //         searchTerm,
    //         totalProductsFound: products.length,
    //         totalAsinsFromSummary: summaryStats['Total ASINs'],
    //         timestamp: new Date().toISOString()
    //     }
    // };

    return products
}

function createEmptyProduct() {
    return {
        "Display Order": "",
        "Image": null,
        "Product Details": "",
        "ASIN": "",
        "URL": { "text": "", "hyperlink": "" },
        "Image URL": { "text": "", "hyperlink": "" },
        "Brand": "",
        "Price  $": "",
        "Parent Level Sales": "",
        "ASIN Sales": "",
        "Recent Purchases": "",
        "Parent Level Revenue": "",
        "ASIN Revenue": "",
        "Title Char. Count": "",
        "BSR": "",
        "Seller Country/Region": "",
        "Fees  $": "",
        "Active Sellers": "",
        "Ratings": "",
        "Review Count": "",
        "Images": "",
        "Review velocity": "",
        "Buy Box": "",
        "Category": "",
        "Size Tier": "",
        "Fulfillment": "",
        "Dimensions": "",
        "Weight": "",
        "ABA Most Clicked": "N/A",
        "Creation Date": "",
        "Sponsored": "",
        "Best Seller": "No",
        "Seller Age (mo)": "",
        "Seller": "",
        "imageBase64": ""
    };
}

/* XRAY KEYWORDS TABLE STEP 3 IN SCRAPPING */
function parseKeywordData(filepath) {
    const html = fs.readFileSync(filepath, "utf8");
    const $ = cheerio.load(html);
    const keywords = [];

    // Find all table rows that contain keyword data
    // They have the class 'datacy-rowextension-xrayKeywords' followed by a number
    $('[class*="datacy-rowextension-xrayKeywords"]').each((index, row) => {
        const $row = $(row);

        // Extract Keyword Phrase
        const keywordElement = $row.find('[data-testid="table-cell-phrase"] a div:first-child');
        const keywordPhrase = keywordElement.text().trim();

        // Extract Cerebro IQ Score
        const iqScore = $row.find('[data-testid="table-cell-iq"] .sc-ebpdWe').text().trim();

        // Extract Search Volume - remove commas and convert to number string
        const searchVolumeElement = $row.find('[data-testid="table-cell-impressionExact30"] .sc-ebpdWe');
        let searchVolume = searchVolumeElement.text().trim().replace(/,/g, '');

        // Extract Search Volume Trend
        const trendElement = $row.find('[data-testid="table-cell-searchVolumeTrend30"] .sc-equzhJ');
        let searchVolumeTrend = trendElement.text().trim();
        // Remove % sign and keep as string with sign
        if (searchVolumeTrend) {
            searchVolumeTrend = searchVolumeTrend.replace('%', '');
        }

        // Extract Suggested PPC Bid
        const bidElement = $row.find('[data-testid="table-cell-cpc"] .sc-tfGui');
        let suggestedPpcBid = bidElement.text().trim();
        // Get the range part which is in a separate div
        const rangeElement = $row.find('[data-testid="table-cell-cpc"] .sc-gNKlcE');
        if (rangeElement.length) {
            const range = rangeElement.text().trim();
            suggestedPpcBid = `${suggestedPpcBid} ${range}`;
        }

        // Extract Keyword Sales
        const sales = $row.find('[data-testid="table-cell-monthlySales"] .sc-ebpdWe').text().trim();

        // Extract Competing Products - remove commas
        let competingProducts = $row.find('[data-testid="table-cell-resultsNumber"]').text().trim();
        competingProducts = competingProducts.replace(/,/g, '');

        // Extract Title Density
        let titleDensity = $row.find('[data-testid="table-cell-exactTitleMatchProductsCount"] .sc-ebpdWe').text().trim();

        // Extract Competitor Rank (avg)
        const competitorRank = $row.find('[data-testid="table-cell-organicPositionAverage"] .sc-ebpdWe').text().trim();

        // Only add if we have at least a keyword phrase
        if (keywordPhrase) {
            keywords.push({
                "Keyword Phrase": keywordPhrase,
                "Cerebro IQ Score": iqScore || "",
                "Search Volume": searchVolume || "",
                "Search Volume Trend": searchVolumeTrend || "",
                "Suggested PPC Bid": suggestedPpcBid || "",
                "Keyword Sales": sales || "",
                "Competing Products": competingProducts || "",
                "Title Density": titleDensity || "",
                "Competitor Rank (avg)": competitorRank || ""
            });
        }
    });

    return keywords;
}

function extractCleanText(el, selector = null) {
    let $;

    // لو el string HTML كامل
    if (typeof el === 'string') {
        $ = cheerio.load(el);
        el = $.root(); // نخلي root
    }
    // لو el Cheerio element بالفعل
    else if (el.cheerio) {
        $ = el.constructor; // instance من cheerio
    }
    // لو el DOM node
    else {
        $ = cheerio.load('<root></root>'); // create dummy root
        $.root().append(el);
        el = $.root();
    }

    let target = selector ? $(el).find(selector) : $(el);

    // remove style, script, svg, noscript
    target.find('style, script, svg, noscript').remove();

    // remove all attributes (optional)
    target.find('*').each((i, e) => {
        Object.keys(e.attribs || {}).forEach(attr => {
            $(e).removeAttr(attr);
        });
    });

    // get clean text
    let text = target.text()
        .replace(/:root\s*{[^}]+}/gs, '')
        .replace(/--fa-[^;]+;/g, '')
        .replace(/\s+/g, ' ')
        .trim();

    return text || null;
}

/* Items List */
async function extractAmazonProductsGPT(filepath) {
    const html = fs.readFileSync(filepath, 'utf8');
    const $ = cheerio.load(html);

    const products = [];

    $('.s-main-slot .s-result-item[data-asin]').each((i, el) => {
        const asin = $(el).attr('data-asin');
        if (!asin) return;

        // ----- BASIC -----
        const title = $(el).find('h2 span').first().text().trim() || null;

        // ---------- LINK EXTRACTION (robust) ----------
        let link =
            $(el).find('h2 a').attr('href') ||
            $(el).find('a[href*="/dp/"]').attr('href') ||
            $(el).find('a[href*="/gp/product/"]').attr('href');

        // clean tracking params
        if (link) {
            const match = link.match(/\/(dp|gp\/product)\/([A-Z0-9]{10})/);
            if (match) link = `https://www.amazon.com/dp/${match[2]}`;
        }

        // ultimate fallback
        if (!link && asin) link = `https://www.amazon.com/dp/${asin}`;

        const image = $(el).find('img.s-image').attr('src') || null;
        const sponsored = $(el).text().includes('Sponsored');

        // ----- BRAND -----
        let brand = extractCleanText(el, 'h2 + div span');

        // ----- RATING -----
        let ratingText = extractCleanText(el, '.a-icon-alt');

        let rating = ratingText
            ? parseFloat(ratingText.split(' ')[0])
            : null;

        let reviewCount = extractCleanText(el, '.a-size-base.s-underline-text');

        // ----- PRICES -----
        let priceCurrent = extractCleanText(el, '.a-price .a-offscreen');
        let priceBefore = extractCleanText(el, '.a-text-price .a-offscreen');

        let discountPercent = null;
        if (priceBefore && priceCurrent) {
            const before = parseFloat(priceBefore);
            const now = parseFloat(priceCurrent);
            if (before > now) discountPercent = Math.round(((before - now) / before) * 100);
        }

        // ----- BADGES -----
        let badge = extractCleanText(el, '.a-badge-text, .a-badge-label');

        // ----- PRIME -----
        let prime = $(el).find('.a-icon-prime').length > 0;

        // ----- DELIVERY -----
        let delivery = extractCleanText(el, '[aria-label*="delivery"], .s-shipping-message');

        // // ----- COUPON -----
        let coupon = extractCleanText(el, ':contains("coupon"), :contains("Save")');

        // // ----- STOCK HINT -----
        let availability = extractCleanText(el, ':contains("left"), :contains("stock")');

        // ----- UNITS BOUGHT -----
        let boughtText = extractCleanText(el, ':contains("bought")', $)
        // ----- VARIATIONS -----
        let variations = $(el)
            .find('[aria-label*="color"], [aria-label*="size"]')
            .length || null;

        products.push({
            asin,
            title,
            link,
            image,
            brand,
            rating,
            reviewCount,
            badge,
            priceCurrent,
            priceBefore,
            discountPercent,
            coupon,
            availability,
            delivery,
            boughtText,
            variations,
            prime,
            sponsored
        });
    });

    return products;
}

module.exports = {
    parseCSV,
    parseXLSX,
    parseHTMLTable,
    parseChart,
    findKeywordCSV,
    findXrayKeywordCSV,
    fileExists,
    parseSeachExpander,
    parseXrayHtml,
    parseKeywordData,
    extractAmazonProductsGPT,
}
