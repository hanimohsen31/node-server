const { JSDOM } = require('jsdom')
const { TheRunDown } = require('./TheRunDown')
const { extractTechCrunchCards } = require('./TechCrunch')
const { extractOpenAICards } = require('./Openai')
const { Superhuman } = require('./Superhuman')
const { Deepmind } = require('./Deepmind')
const { Ycombinator } = require('./Ycombinator')
const { Artificialintelligence } = require('./Artificialintelligence')
const { Aiweekly } = require('./Aiweekly')
const { Github } = require('./Github')
const { X } = require('./X')
const { Youtube } = require('./Youtube')
const { Facebook } = require('./Facebook')
const { GoogleNews } = require('./GoogleNews')

// ── Parser registry ──────────────────────────────────────────────────────────
// Each entry maps a section id (as written by the scraper) to its parser fn.
const PARSERS = [
  { source: 'TheRunDown', fn: TheRunDown },
  { source: 'TechCrunch', fn: extractTechCrunchCards },
  { source: 'Openai', fn: extractOpenAICards },
  { source: 'Superhuman', fn: Superhuman },
  { source: 'Deepmind', fn: Deepmind },
  { source: 'Ycombinator', fn: Ycombinator },
  { source: 'Artificialintelligence', fn: Artificialintelligence },
  { source: 'Aiweekly', fn: Aiweekly },
  { source: 'Github', fn: Github },
  { source: 'X', fn: X },
  { source: 'Youtube', fn: Youtube },
  { source: 'Facebook', fn: Facebook },
  { source: 'GoogleNews', fn: GoogleNews },
]

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Returns the outerHTML of the <section id="sectionId"> found in fullHtml,
 * or an empty string if not present. Isolating each section prevents parsers
 * from accidentally picking up elements that belong to other sources.
 */
function getSectionHtml(document, sectionId) {
  const sections = document.querySelectorAll(`section[id="${sectionId}"]`)
  if (!sections.length) return ''
  return Array.from(sections).map((s) => s.outerHTML).join('')
}

/**
 * Normalises parser output to a plain array so every source entry is uniform.
 *  - Aiweekly      → single object  → wrap in [ ]
 *  - Artificialintelligence → { latest, trending } → merge with a `type` tag
 *  - everything else is already an array
 */
function normalizeItems(source, raw) {
  if (!raw) return []
  if (source === 'Aiweekly') return [raw]
  if (source === 'Artificialintelligence') {
    return [
      ...(raw.latest || []).map((item) => ({ ...item, type: 'latest' })),
      ...(raw.trending || []).map((item) => ({ ...item, type: 'trending' })),
    ]
  }
  return Array.isArray(raw) ? raw : [raw]
}

// ── Main export ───────────────────────────────────────────────────────────────

/**
 * Receives the full combined newsletter HTML (all scraped sections) and runs
 * every registered parser against its own <section> slice.
 */
function extractAll(html) {
  const { document } = new JSDOM(html).window

  return PARSERS.reduce((results, { source, fn }) => {
    try {
      const sectionHtml = getSectionHtml(document, source)
      if (!sectionHtml) return results

      const raw = fn(sectionHtml)
      const items = normalizeItems(source, raw)
      if (items.length) {
        results.push({ source, count: items.length, items })
      }
    } catch (err) {
      console.error(`[extractAll] ${source} failed: ${err.message}`)
    }
    return results
  }, [])
}

// ── HTML view generator ───────────────────────────────────────────────────────

/** Source-specific icon map */
const SOURCE_ICONS = {
  TheRunDown: '📰',
  TechCrunch: '🚀',
  Openai: '🤖',
  Superhuman: '⚡',
  Deepmind: '🧠',
  Ycombinator: '🟠',
  Artificialintelligence: '🔬',
  Aiweekly: '📬',
  Github: '🐙',
  X: '✖️',
  Youtube: '▶️',
  Facebook: '👥',
  GoogleNews: 'G',
}

/** Renders one item card depending on the available fields */
function renderCard(item) {
  const img = item.image?.src || item.thumbnail?.src || item.avatar || null
  const title = item.title || item.text?.slice(0, 120) || item.name || '(no title)'
  const url = item.url || item.tweetUrl || item.commentsUrl || '#'
  const meta = [
    item.date || item.publishedAt || item.publishedLabel || item.dateText || item.publishedAgo || '',
    item.category || item.language || item.handle || '',
    item.type ? `<span class="badge">${item.type}</span>` : '',
    item.points != null ? `▲ ${item.points}` : '',
    item.stars != null ? `★ ${item.stars}` : '',
    item.views || '',
    item.starsToday || '',
  ]
    .filter(Boolean)
    .join(' · ')

  const description = item.description || item.subtitle || item.content?.slice(0, 200) || ''

  const stats = item.stats
    ? Object.entries(item.stats)
        .filter(([, v]) => v)
        .map(([k, v]) => `<span>${v} ${k}</span>`)
        .join(' ')
    : item.reactions
      ? Object.entries(item.reactions)
          .map(([k, v]) => `<span>${v} ${k}</span>`)
          .join(' ')
      : ''

  return `
    <a class="card" href="${url}" target="_blank" rel="noopener noreferrer">
      ${img ? `<div class="card-img"><img src="${img}" alt="" loading="lazy"/></div>` : ''}
      <div class="card-body">
        <div class="card-title">${title}</div>
        ${meta ? `<div class="card-meta">${meta}</div>` : ''}
        ${description ? `<div class="card-desc">${description}</div>` : ''}
        ${stats ? `<div class="card-stats">${stats}</div>` : ''}
      </div>
    </a>`
}

function generateHTML(data) {
  const nav = data
    .map(({ source, count }) => `<a href="#${source}">${SOURCE_ICONS[source] || '📄'} ${source} <span class="nav-count">${count}</span></a>`)
    .join('\n      ')

  const sections = data
    .map(
      ({ source, count, items }) => `
  <section id="${source}">
    <h2>${SOURCE_ICONS[source] || '📄'} ${source} <span class="section-count">${count} items</span></h2>
    <div class="cards">
      ${items.map(renderCard).join('\n      ')}
    </div>
  </section>`
    )
    .join('\n')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Newsletter Dashboard</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, sans-serif; background: #0f0f0f; color: #e0e0e0; }

    /* ── Nav ── */
    nav { position: sticky; top: 0; z-index: 10; background: #1a1a1a; border-bottom: 1px solid #2a2a2a;
          display: flex; flex-wrap: wrap; gap: 4px; padding: 10px 20px; }
    nav a { color: #aaa; text-decoration: none; font-size: 13px; padding: 4px 10px;
            border-radius: 20px; border: 1px solid #333; white-space: nowrap; transition: all .15s; }
    nav a:hover { color: #fff; border-color: #555; background: #2a2a2a; }
    .nav-count { background: #333; border-radius: 10px; padding: 1px 6px; font-size: 11px; margin-left: 4px; }

    /* ── Sections ── */
    section { padding: 32px 20px; border-bottom: 1px solid #1e1e1e; max-width: 1400px; margin: 0 auto; }
    h2 { font-size: 20px; font-weight: 700; margin-bottom: 18px; color: #fff; display: flex; align-items: center; gap: 10px; }
    .section-count { font-size: 13px; font-weight: 400; color: #666; }

    /* ── Cards grid ── */
    .cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 14px; }
    .card { display: flex; flex-direction: column; background: #1a1a1a; border: 1px solid #2a2a2a;
            border-radius: 10px; overflow: hidden; text-decoration: none; color: inherit;
            transition: border-color .15s, transform .15s; }
    .card:hover { border-color: #444; transform: translateY(-2px); }
    .card-img { aspect-ratio: 16/9; overflow: hidden; background: #111; }
    .card-img img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .card-body { padding: 12px; display: flex; flex-direction: column; gap: 6px; flex: 1; }
    .card-title { font-size: 18px; font-weight: 600; line-height: 1.4; color: #f0f0f0;
                  display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
    .card-meta { font-size: 11px; color: #666; display: flex; flex-wrap: wrap; gap: 4px; align-items: center; }
    .card-desc { font-size: 12px; color: #888; line-height: 1.5;
                 display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
    .card-stats { font-size: 11px; color: #555; display: flex; flex-wrap: wrap; gap: 8px; margin-top: auto; padding-top: 6px; border-top: 1px solid #222; }
    .badge { background: #2a3a2a; color: #6f9; border-radius: 4px; padding: 1px 5px; font-size: 10px; }
  </style>
</head>
<body>
  <nav>
    ${nav}
  </nav>
  ${sections}
</body>
</html>`
}

module.exports = { extractAll, generateHTML }
