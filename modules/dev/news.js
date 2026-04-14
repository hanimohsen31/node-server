const cheerio = require("cheerio");

// ----------------  DIVIDER  CONFIG ----------------------------------------------------
const KEYWORDS = ["ai", "agent", "llm", "gpt", "machine learning"];
const websites = [
    'https://aiweekly.co/',
    'https://aimagazine.com/',
    'https://openai.com/news/',
    'https://www.therundown.ai/',
    'https://www.superhuman.ai/',
    'https://deepmind.google/blog/',
    "https://news.ycombinator.com/",
    'https://www.artificialintelligence-news.com/',
    'https://blog.google/innovation-and-ai/technology/ai/',
    'https://techcrunch.com/category/artificial-intelligence/',
    'https://www.reuters.com/technology/artificial-intelligence/',
    // reddit
    'https://www.reddit.com/r/LocalLLaMA/',
    'https://www.reddit.com/r/programming/',
    'https://www.reddit.com/r/MachineLearning/',
    // github
    'https://github.com/trending',
    // x
    'https://x.com/sama',
    'https://x.com/karpathy',
    'https://x.com/gdb',
    "https://x.com/GhareebElshaikh",
    'https://x.com/Osama_Elzero',
    // youtube
    'https://www.youtube.com/@Fireship',
    'https://www.youtube.com/@ThePrimeTimeagen',
    'https://www.youtube.com/@aiexplained-official',
    'https://www.youtube.com/@yehiatech',
    'https://www.youtube.com/@freecodecamp',
    'https://www.youtube.com/@NagdyWP',
    "https://www.youtube.com/@TinaHuang1",
    // facebook
    'https://www.facebook.com/OsElzero',
    "https://www.facebook.com/ghareebelshaikh.official",
]
// ----------------  DIVIDER  HELPERS ---------------------------------------------------
const isRelevant = (text) => {
    text = text.toLowerCase();
    return KEYWORDS.some(k => text.includes(k));
};

const fetchHTML = async (url) => {
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!res.ok) throw new Error(`Failed to fetch ${url}`);
    return await res.text();
};

// ----------------  DIVIDER  GITHUB TRENDING -------------------------------------------
const getGitHubTrending = async () => {
    const html = await fetchHTML("https://github.com/trending");
    const $ = cheerio.load(html);
    const repos = [];
    $("article.Box-row").each((i, el) => {
        const title = $(el).find("h2 a").text().trim().replace(/\s+/g, " ");
        const desc = $(el).find("p").text().trim();
        if (isRelevant(title + " " + desc)) repos.push({ title, desc, url: "https://github.com" + $(el).find("h2 a").attr("href"), });
    });
    return repos.slice(0, 5);
};

// ----------------  DIVIDER  HACKER NEWS -----------------------------------------------
const getHackerNews = async () => {
    const html = await fetchHTML("https://news.ycombinator.com/");
    const $ = cheerio.load(html);
    const posts = [];
    $(".athing").each((i, el) => {
        const title = $(el).find(".titleline a").text();
        const url = $(el).find(".titleline a").attr("href");
        if (isRelevant(title)) posts.push({ title, url });
    });
    return posts.slice(0, 5);
};

// ----------------  DIVIDER  MAIN ------------------------------------------------------
const run = async () => {
    try {
        console.log("🚀 AI Trends Today:\n");
        const [github, hn] = await Promise.all([getGitHubTrending(), getHackerNews(),]);
        console.log("📦 GitHub Trending:");
        github.forEach((r) => {
            console.log(`- ${r.title}`);
            console.log(`  ${r.desc}`);
            console.log(`  ${r.url}\n`);
        });
        console.log("📰 Hacker News:");
        hn.forEach((p) => {
            console.log(`- ${p.title}`);
            console.log(`  ${p.url}\n`);
        });
    } catch (err) {
        console.error("❌ Error:", err.message);
    }
};

run();