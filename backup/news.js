const express = require('express');
const puppeteer = require('puppeteer');
const app = express();
const PORT = 3000;

// Telegram channel URLs
const channels = {
  goldPrice: 'https://web.telegram.org/k/#?tgaddr=tg%3A%2F%2Fresolve%3Fdomain%3Dgoldprice10000',
  elfayda: 'https://web.telegram.org/k/#@Alfaydaeconomy',
  goldSilverExpectations: 'https://web.telegram.org/k/#@goldnews10000',
  forex: 'https://web.telegram.org/k/#@ForexNews24hours'
};

// TradingView iframe URL
const tradingViewLink = 'https://s.tradingview.com/goldprice/widgetembed/?hideideas=1&overrides=%7B%7D&enabled_features=%5B%5D&disabled_features=%5B%5D&locale=en#%7B%22symbol%22%3A%22TVC%3AGOLD%22%2C%22frameElementId%22%3A%22tradingview_246ab%22%2C%22interval%22%3A%22D%22%2C%22hide_side_toolbar%22%3A%220%22%2C%22allow_symbol_change%22%3A%221%22%2C%22save_image%22%3A%221%22%2C%22watchlist%22%3A%22TVC%3AGOLD%5Cu001fTVC%3ASILVER%5Cu001fTVC%3APLATINUM%5Cu001fTVC%3APALLADIUM%5Cu001fTVC%3AGOLDSILVER%5Cu001fTVC%3AUSOIL%5Cu001fOANDA%3AEURUSD%5Cu001fFX_IDC%3AUSDJPY%5Cu001fINDEX%3AHUI%5Cu001fINDEX%3AXAU%5Cu001fCOINBASE%3ABTCUSD%22%2C%22details%22%3A%221%22%2C%22studies%22%3A%22%5B%5D%22%2C%22theme%22%3A%22White%22%2C%22style%22%3A%221%22%2C%22timezone%22%3A%22America%2FNew_York%22%2C%22hideideasbutton%22%3A%221%22%2C%22withdateranges%22%3A%221%22%2C%22studies_overrides%22%3A%22%7B%7D%22%2C%22utm_source%22%3A%22goldprice.org%22%2C%22utm_medium%22%3A%22widget%22%2C%22utm_campaign%22%3A%22chart%22%2C%22utm_term%22%3A%22TVC%3AGOLD%22%2C%22page-uri%22%3A%22goldprice.org%2F%22%7D';

// Function to scrape a Telegram channel
async function scrapeTelegramChannel(url, channelName) {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    
    console.log(`Navigating to ${channelName}...`);
    await page.goto(url, { 
      waitUntil: 'networkidle2',
      timeout: 60000 
    });
    
    // Wait for messages to load
    await page.waitForTimeout(5000);
    
    // Try to extract messages
    const messages = await page.evaluate(() => {
      const messageElements = document.querySelectorAll('.message, .Message, [class*="message"]');
      const results = [];
      
      messageElements.forEach((el, index) => {
        if (index < 10) { // Get latest 10 messages
          const text = el.innerText || el.textContent;
          if (text && text.trim()) {
            results.push(text.trim());
          }
        }
      });
      
      return results;
    });
    
    await browser.close();
    
    return {
      channel: channelName,
      messages: messages.length > 0 ? messages : ['No messages found or channel requires login'],
      success: messages.length > 0
    };
    
  } catch (error) {
    if (browser) await browser.close();
    return {
      channel: channelName,
      messages: [`Error: ${error.message}`],
      success: false
    };
  }
}

// Root route - display HTML with iframe and scraped data
app.get('/', async (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Telegram Channels Scraper</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
          min-height: 100vh;
        }
        
        .container {
          max-width: 1400px;
          margin: 0 auto;
        }
        
        h1 {
          color: white;
          text-align: center;
          margin-bottom: 30px;
          font-size: 2.5em;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        
        .chart-container {
          background: white;
          border-radius: 15px;
          padding: 20px;
          margin-bottom: 30px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }
        
        .chart-container h2 {
          margin-bottom: 15px;
          color: #333;
        }
        
        iframe {
          width: 100%;
          height: 600px;
          border: none;
          border-radius: 10px;
        }
        
        .scraper-section {
          background: white;
          border-radius: 15px;
          padding: 30px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }
        
        .scraper-section h2 {
          margin-bottom: 20px;
          color: #333;
        }
        
        .button-container {
          display: flex;
          gap: 15px;
          flex-wrap: wrap;
          margin-bottom: 30px;
        }
        
        button {
          flex: 1;
          min-width: 200px;
          padding: 15px 25px;
          font-size: 16px;
          font-weight: 600;
          color: white;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }
        
        button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.3);
        }
        
        button:disabled {
          background: #ccc;
          cursor: not-allowed;
          transform: none;
        }
        
        #results {
          margin-top: 20px;
        }
        
        .channel-result {
          background: #f8f9fa;
          border-left: 4px solid #667eea;
          padding: 20px;
          margin-bottom: 20px;
          border-radius: 8px;
        }
        
        .channel-result h3 {
          color: #667eea;
          margin-bottom: 15px;
          font-size: 1.3em;
        }
        
        .message {
          background: white;
          padding: 12px 15px;
          margin-bottom: 10px;
          border-radius: 6px;
          border-left: 3px solid #764ba2;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        
        .loading {
          text-align: center;
          padding: 40px;
          color: #667eea;
          font-size: 18px;
        }
        
        .spinner {
          border: 4px solid #f3f3f3;
          border-top: 4px solid #667eea;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin: 20px auto;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>📊 Gold Price Tracker & Telegram Channels</h1>
        
        <div class="chart-container">
          <h2>📈 TradingView Gold Price Chart</h2>
          <iframe src="${tradingViewLink}"></iframe>
        </div>
        
        <div class="scraper-section">
          <h2>📱 Telegram Channels Scraper</h2>
          <div class="button-container">
            <button onclick="scrapeChannel('goldPrice')">Gold Price Channel</button>
            <button onclick="scrapeChannel('elfayda')">Elfayda Economy</button>
            <button onclick="scrapeChannel('goldSilverExpectations')">Gold News</button>
            <button onclick="scrapeChannel('forex')">Forex News 24h</button>
            <button onclick="scrapeAll()">Scrape All Channels</button>
          </div>
          
          <div id="results"></div>
        </div>
      </div>
      
      <script>
        const resultsDiv = document.getElementById('results');
        
        async function scrapeChannel(channelName) {
          const buttons = document.querySelectorAll('button');
          buttons.forEach(btn => btn.disabled = true);
          
          resultsDiv.innerHTML = '<div class="loading"><div class="spinner"></div><p>Scraping channel... This may take a minute.</p></div>';
          
          try {
            const response = await fetch(\`/scrape/\${channelName}\`);
            const data = await response.json();
            displayResults([data]);
          } catch (error) {
            resultsDiv.innerHTML = \`<div class="channel-result"><h3>Error</h3><p>\${error.message}</p></div>\`;
          } finally {
            buttons.forEach(btn => btn.disabled = false);
          }
        }
        
        async function scrapeAll() {
          const buttons = document.querySelectorAll('button');
          buttons.forEach(btn => btn.disabled = true);
          
          resultsDiv.innerHTML = '<div class="loading"><div class="spinner"></div><p>Scraping all channels... This will take a few minutes.</p></div>';
          
          try {
            const response = await fetch('/scrape/all');
            const data = await response.json();
            displayResults(data);
          } catch (error) {
            resultsDiv.innerHTML = \`<div class="channel-result"><h3>Error</h3><p>\${error.message}</p></div>\`;
          } finally {
            buttons.forEach(btn => btn.disabled = false);
          }
        }
        
        function displayResults(results) {
          resultsDiv.innerHTML = '';
          
          results.forEach(result => {
            const channelDiv = document.createElement('div');
            channelDiv.className = 'channel-result';
            
            const title = document.createElement('h3');
            title.textContent = result.channel + (result.success ? ' ✅' : ' ⚠️');
            channelDiv.appendChild(title);
            
            if (result.messages && result.messages.length > 0) {
              result.messages.forEach(msg => {
                const msgDiv = document.createElement('div');
                msgDiv.className = 'message';
                msgDiv.textContent = msg;
                channelDiv.appendChild(msgDiv);
              });
            } else {
              const noMsg = document.createElement('p');
              noMsg.textContent = 'No messages found';
              channelDiv.appendChild(noMsg);
            }
            
            resultsDiv.appendChild(channelDiv);
          });
        }
      </script>
    </body>
    </html>
  `);
});

// Scrape individual channel
app.get('/scrape/:channel', async (req, res) => {
  const channelKey = req.params.channel;
  
  if (!channels[channelKey]) {
    return res.status(404).json({ error: 'Channel not found' });
  }
  
  const result = await scrapeTelegramChannel(channels[channelKey], channelKey);
  res.json(result);
});

// Scrape all channels
app.get('/scrape/all', async (req, res) => {
  const results = [];
  
  for (const [key, url] of Object.entries(channels)) {
    const result = await scrapeTelegramChannel(url, key);
    results.push(result);
  }
  
  res.json(results);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Visit the URL to see the TradingView chart and scrape Telegram channels');
});