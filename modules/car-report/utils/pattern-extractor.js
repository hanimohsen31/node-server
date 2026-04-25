/**
 * pattern-extractor.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Ported from Instant Data Scraper (chrome ext v1.2.1) → Node.js / jsdom
 *
 * What this module does:
 *   1. findTables(document)      — scores every DOM element and returns the top
 *                                  candidate "table" containers (same algorithm
 *                                  as IDS onload.js)
 *   2. getTableData(tableInfo)   — walks the candidate rows, extracts every
 *                                  text / href / src leaf and returns raw rows
 *   3. buildTable(rawRows)       — normalises raw rows into { fields, data }
 *                                  ready to send to your scraper server
 *   4. extractAll(document)      — convenience: runs 1-3 for the best candidate
 *
 * Usage with your Node.js scraper:
 *   const { extractAll, findTables, getTableData, buildTable } = require('./pattern-extractor');
 *   const { JSDOM } = require('jsdom');
 *
 *   const dom  = new JSDOM(htmlString);
 *   const result = extractAll(dom.window.document);
 *   // result → { fields: [...], data: [[...], [...]], tableSelector: '...' }
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

// ─── helpers ────────────────────────────────────────────────────────────────

/**
 * Return the class list of a DOM element as a sorted string array.
 * (mirrors IDS `o()`)
 */
function getClasses(el) {
  return (el.getAttribute('class') || '')
    .trim()
    .split(/\s+/)
    .filter(c => c.length > 0);
}

/**
 * Escape special CSS characters in a string.
 * (mirrors IDS `t()`)
 */
function escapeCss(str, sep = '.') {
  return sep + str.replace(/[!"#$%&'()*+,.\/:;<=>?@[\\\]^`{|}~]/g, '\\$&').trim();
}

/**
 * Get the direct text content of an element — its own text nodes only,
 * not those of its children.
 * (mirrors IDS `u()`)
 */
function ownText(el) {
  let text = '';
  el.childNodes.forEach(node => {
    if (node.nodeType === 3 /* TEXT_NODE */) text += node.textContent;
  });
  return text.trim();
}

const SKIP_TAGS = new Set(['script', 'img', 'meta', 'style']);

/**
 * Build a CSS selector path for an element by walking its ancestor chain.
 * (mirrors IDS `w()`)
 */
function buildSelector(el) {
  const parts = [];
  let cur = el;
  while (cur && cur.nodeName !== 'HTML' && cur.nodeName !== 'BODY') {
    let part = cur.tagName.toLowerCase();
    const id = (cur.id || '').trim();
    const cls = (cur.className || '').trim();
    if (id && !id.match(/\d+/g)) {
      part += escapeCss(id, '#');
    } else if (cls) {
      part += escapeCss(cls).replace(/\s+/g, '.');
    }
    parts.unshift(part);
    cur = cur.parentElement;
  }
  return parts.join('>');
}

// ─── 1. findTables ──────────────────────────────────────────────────────────

/**
 * Analyse an element's children to find which CSS classes appear on
 * at least half of them — those are the "row" classes.
 * Returns { children: Element[], goodClasses: string[] }
 * (mirrors IDS `n()`)
 */
function analyseChildren(el) {
  const children = Array.from(el.children).filter(child => {
    const tag = child.nodeName.toLowerCase();
    return !SKIP_TAGS.has(tag) && child.textContent.trim().length > 0;
  });

  const classCountByCombo = {};   // full class-combo → count
  const classCountSingle  = {};   // single class     → count

  children.forEach(child => {
    const classes = getClasses(child).sort();
    const key = classes.join(' ');
    classCountByCombo[key] = (classCountByCombo[key] || 0) + 1;
    classes.forEach(c => {
      classCountSingle[c] = (classCountSingle[c] || 0) + 1;
    });
  });

  const threshold = children.length / 2 - 2;

  let goodClasses = Object.keys(classCountByCombo).filter(k => classCountByCombo[k] >= threshold);
  if (!goodClasses.length) {
    goodClasses = Object.keys(classCountSingle).filter(k => classCountSingle[k] >= threshold);
  }

  if (!goodClasses.length || (goodClasses.length === 1 && goodClasses[0] === '')) {
    return { children, goodClasses: [] };
  }

  // keep only children that match at least one goodClass combo
  const matchedChildren = children.filter(child => {
    return goodClasses.some(combo => {
      const required = combo.split(' ');
      return required.every(c => child.classList.contains(c));
    });
  });

  return { children: matchedChildren.length ? matchedChildren : children, goodClasses };
}

/**
 * Score every DOM element and return the top `limit` table candidates.
 * (mirrors IDS `a()` / findTables)
 *
 * @param {Document} document   - jsdom document
 * @param {number}   limit      - max candidates to return (default 5)
 * @returns {TableCandidate[]}
 *
 * @typedef {{ el: Element, selector: string, goodClasses: string[],
 *             children: Element[], score: number }} TableCandidate
 */
function findTables(document, limit = 5) {
  const bodyWidth  = document.body ? document.body.scrollWidth  : 1920;
  const bodyHeight = document.body ? document.body.scrollHeight : 1080;
  const bodyArea   = bodyWidth * bodyHeight;

  const candidates = [];

  document.querySelectorAll('body *').forEach(el => {
    const rect  = el.getBoundingClientRect ? el.getBoundingClientRect() : null;
    // In jsdom getBoundingClientRect always returns 0; fall back to a heuristic
    const elArea = rect && (rect.width * rect.height > 0)
      ? rect.width * rect.height
      : estimateArea(el, bodyArea);

    if (isNaN(elArea) || elArea < 0.02 * bodyArea) return;

    const { children, goodClasses } = analyseChildren(el);
    if (!children.length || children.length < 3) return;

    const score = elArea * children.length * children.length;
    candidates.push({
      el,
      selector   : buildSelector(el),
      goodClasses,
      children,
      score,
    });
  });

  return candidates
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/**
 * jsdom has no layout engine, so getBoundingClientRect() returns zeros.
 * We estimate area from tag semantics + child count instead.
 */
function estimateArea(el, bodyArea) {
  const tag = el.tagName.toLowerCase();
  const BLOCK_TAGS = new Set(['ul','ol','table','tbody','div','section','article','main','aside','nav']);
  if (!BLOCK_TAGS.has(tag)) return 0;
  // give block elements a synthetic area proportional to child count
  const childCount = el.children.length;
  if (childCount < 3) return 0;
  // rough heuristic: each child row occupies ~40px height × full width
  return (bodyArea / 1920) * 1920 * childCount * 40;
}

// ─── 2. getTableData ────────────────────────────────────────────────────────

/**
 * Walk the rows of a TableCandidate and extract all leaf values.
 * Returns an array of raw row objects keyed by XPath-like internal paths.
 * (mirrors IDS `b()` inner loop)
 *
 * @param {TableCandidate} tableInfo
 * @returns {Object[]}  raw rows
 */
function getTableData(tableInfo) {
  const rows = [];

  tableInfo.children.forEach(rowEl => {
    const record = {};
    const pathsSeen = [];

    function walk(el, parentPath) {
      if (!el.nodeName) return;
      const tag     = el.nodeName.toLowerCase();
      const classes = getClasses(el).map(c => '.' + c).join('');
      const path    = parentPath + '/' + tag + classes;

      pathsSeen.push(path);

      // text value
      const text = ownText(el);
      if (text) storeProp(record, pathsSeen, path, text);

      // href / src
      const href = el.getAttribute('href');
      const src  = el.getAttribute('src');
      if (href) storeProp(record, pathsSeen, path + ' href', href);
      if (src)  storeProp(record, pathsSeen, path + ' src',  src);

      Array.from(el.children).forEach(child => walk(child, path));
    }

    walk(rowEl, '');
    if (Object.keys(record).length) rows.push(record);
  });

  return rows;
}

/**
 * Store a prop in `record`, disambiguating duplicate paths with a counter.
 * (mirrors IDS `n()` inner helper inside row loop)
 */
function storeProp(record, pathsSeen, path, value) {
  // count how many times this path key appeared so far
  const base = path;
  let count  = 0;
  pathsSeen.forEach(p => { if (p === base) count++; });
  const key  = count > 1 ? `${path} ${count}` : path;
  record[key] = value;
}

// ─── 3. buildTable ──────────────────────────────────────────────────────────

/**
 * Collapse raw path-keyed rows into a clean { fields, data } table.
 * - Picks the shortest CSS-like label from each path.
 * - Filters out columns present in < 20 % of rows.
 * - Deduplicates identical columns.
 * (mirrors IDS `h()` in popup.js)
 *
 * @param {Object[]} rawRows
 * @returns {{ fields: string[], data: string[][] }}
 */
function buildTable(rawRows) {
  if (!rawRows.length) return { fields: [], data: [] };

  const total = rawRows.length;

  // Count how many rows each path-key appears in
  const pathFreq = {};
  rawRows.forEach(row => {
    Object.keys(row).forEach(k => {
      pathFreq[k] = (pathFreq[k] || 0) + 1;
    });
  });

  // Map path → short human label
  const pathToLabel = {};
  const labelPaths  = {};   // label → [paths]

  Object.keys(pathFreq).forEach(path => {
    let label = '';
    let best  = Infinity;

    // last CSS class segment of the path
    path.split(' ')[0]          // drop trailing qualifier (href/src/count)
      .split('/')
      .slice(1)
      .reverse()
      .forEach(segment => {
        segment.split('.').slice(1).forEach(cls => {
          if (best < 2 * total) return;   // already good enough
          label = cls;
          best  = cls.length;             // prefer shorter
        });
      });

    // append qualifier (href / src)
    const qualifier = path.split(' ')[1];
    if (qualifier && isNaN(qualifier)) label += ' ' + qualifier;

    // disambiguate
    if (label in labelPaths) {
      // find a slot where it doesn't collide
      const presence = rawRows.map(row => path in row);
      let placed = false;
      labelPaths[label].forEach((existing, idx) => {
        if (!placed) {
          const existingPresence = rawRows.map(row => existing in row);
          const collision = presence.some((v, i) => v && existingPresence[i]);
          if (!collision) {
            // merge into the same logical column
            placed = true;
          }
        }
      });
      if (!placed) label += ` ${labelPaths[label].length + 1}`;
      labelPaths[label] = [...(labelPaths[label] || []), path];
    } else {
      labelPaths[label] = [path];
    }

    pathToLabel[path] = label;
  });

  // Group paths by their label
  const labelToPathList = {};
  Object.keys(pathToLabel).forEach(path => {
    const label = pathToLabel[path];
    labelToPathList[label] = labelToPathList[label] || [];
    labelToPathList[label].push(path);
  });

  // Filter labels: must appear in >= 20 % of rows, must not be fully duplicate
  const seenValues = new Set();
  const fields = Object.keys(labelToPathList).filter(label => {
    const paths = labelToPathList[label];
    const freq  = paths.reduce((s, p) => s + (pathFreq[p] || 0), 0);
    if (freq < 0.2 * total) return false;

    const valSig = JSON.stringify(
      rawRows.map(row => {
        for (const p of paths) if (p in row) return row[p];
        return '';
      })
    );
    if (seenValues.has(valSig)) return false;
    seenValues.add(valSig);
    return true;
  });

  // Build 2-D data array
  const data = rawRows.map(row =>
    fields.map(label => {
      for (const p of labelToPathList[label]) {
        if (p in row) return row[p];
      }
      return '';
    })
  );

  return { fields, data };
}

// ─── 4. extractAll ──────────────────────────────────────────────────────────

/**
 * Full pipeline: find tables → extract rows → build clean table.
 * Returns the result for the highest-scoring candidate.
 *
 * @param {Document} document       - jsdom Document
 * @param {object}   [opts]
 * @param {number}   [opts.limit]   - how many candidates to score (default 5)
 * @param {number}   [opts.pick]    - which candidate to use, 0-indexed (default 0 = best)
 * @returns {{ fields: string[], data: string[][], tableSelector: string,
 *             goodClasses: string[], candidates: TableCandidate[] } | null}
 */
function extractAll(document, opts = {}) {
  const { limit = 5, pick = 0 } = opts;

  const candidates = findTables(document, limit);
  if (!candidates.length) return null;

  const chosen  = candidates[pick] || candidates[0];
  const rawRows = getTableData(chosen);
  const table   = buildTable(rawRows);

  return {
    ...table,
    tableSelector : chosen.selector,
    goodClasses   : chosen.goodClasses,
    candidates,          // expose all candidates so caller can pick another
  };
}

// ─── exports ────────────────────────────────────────────────────────────────

module.exports = { findTables, getTableData, buildTable, extractAll };