const fs = require("fs");
const path = require("path");
const cheerio = require("cheerio");

function parseHtmlFile(filePath) {
  const html = fs.readFileSync(filePath, "utf8");
  const $ = cheerio.load(html);

  const tables = [];

  $("table").each((i, table) => {
    const rows = [];

    $(table).find("tbody tr").each((r, tr) => {
      const rowObj = {};

      $(tr).find("td, th").each((c, cell) => {
        const text = $(cell)
          .text()
          .replace(/\s+/g, " ")
          .trim();

        let order = `col_${c + 1}`
        switch (order) {
          case "col_1":
            rowObj[`zikr`] = text;
            break;
          case "col_2":
            rowObj[`repeat`] = text;
            break;
          case "col_3":
            rowObj[`zekrbless`] = text;
            break;
          default:
            rowObj[order] = text;
            break;
        }
      });

      if (Object.keys(rowObj).length) rows.push(rowObj);
    });

    if (rows.length) tables.push(rows);
  });

  return tables;
}

function parseDirectory(dirPath) {
  const results = {};

  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    if (!file.endsWith(".html")) return;

    const fullPath = path.join(dirPath, file);
    console.log("Parsing:", file);

    const parsed = parseHtmlFile(fullPath);

    results[file.split(".")[0]] = parsed[0]
  });

  return results;
}

// ===== usage =====
const dirPath = "./public/html"; // your folder path
const data = parseDirectory(dirPath);

fs.writeFileSync("output.json", JSON.stringify(data, null, 2));
console.log("✅ All files parsed");
