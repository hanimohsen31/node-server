import fs from "fs";
let data = fs.readFileSync("./public/Doaa.json", "utf-8");
data = JSON.parse(data);
console.log(Object.keys(data));