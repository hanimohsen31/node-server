// Lines matching any of these are dropped entirely
const BOILERPLATE_PATTERNS = [
  /^\s*Phone\s*:/i,
  /^\s*E-?Mail\s*:/i,
  /^\s*Website\s*:/i,
  /^\s*Address\s*:/i,
  // address continuation lines: "City – Country, Country"
  /^\s*\w[\w\s,.-]+–.+Egypt/i,
  /^\s*Mokattam/i,
  // Arabic disclaimer keywords
  /تنويه\s*هام/,
  /دور\s*صح/,
  /ساعة\s*فقط/,
  /الفحص\s*النهائ/,
  /عملية\s*ال/,
  /يعد\s*فحصنا/,
  /مسؤولة.*عن.*أعطال/,
  /مركز\s*معتمد/,
]

// RTL extraction artifacts: lines that start with 1-2 Arabic chars then a space
// e.g. "ي شامل للسيارة ف" — these are mid-word PDF fragments
const RTL_FRAGMENT = /^[؀-ۿ]{1,2}\s/

function isJunkArabicFragment(line) {
  const trimmed = line.trim()
  if (trimmed.length === 0) return false
  const arabicChars = (trimmed.match(/[؀-ۿ]/g) || []).length
  const ratio = arabicChars / trimmed.length
  const hasDataValue = /\d/.test(trimmed) // keep lines with numbers (mileage, VIN, etc.)
  if (hasDataValue) return false
  // RTL mid-word artifact: starts with 1-2 Arabic chars then space
  if (ratio > 0.6 && trimmed.length < 30 && RTL_FRAGMENT.test(trimmed)) return true
  // Very short Arabic-only fragment with no real content (e.g. "رشاء .")
  if (ratio > 0.6 && trimmed.length < 12) return true
  return false
}

const isBoilerplate = (line) => BOILERPLATE_PATTERNS.some((re) => re.test(line))

function cleanReportText(text) {
  const lines = text.split('\n')

  const cleaned = lines
    .filter((line) => !isBoilerplate(line))
    .filter((line) => !isJunkArabicFragment(line))
    // Turn separator-only lines (dashes, dots, Arabic punctuation) into blank lines
    .map((line) => (/^[\s\-_.،,–—|]+$/.test(line) ? '' : line))

  return cleaned
    .join('\n')
    // Collapse 3+ consecutive blank lines into one
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .replaceAll(' Phone : 01103305759 - 01103305758\n E-Mail : Info@Dawarsah.com\n Website : Dawarsah.com\n Address : Building No. 5/20, Refaat hassan St, Al-Hadaba Al-Wosta,\nفقط من تاري خ الفحص المذكور أعاله .\n','')
    .replaceAll(` Phone : 01103305759 - 01103305758\n E-Mail : Info@Dawarsah.com\n Website : Dawarsah.com\n Address : Building No. 5/20, Refaat hassan St, Al-Hadaba Al-Wosta,\nفقط من تاري خ الفحص المذكور أعاله .`,'')
}

module.exports = cleanReportText
