// backend/services/scraperService.js
const axios = require('axios');
const cheerio = require('cheerio');

async function scrapeArticle(url) {
    const { data } = await axios.get(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
    });

    const $ = cheerio.load(data);
    let articleText = '';
    $('article p, main p').each((i, elem) => {
        articleText += $(elem).text() + '\n\n';
    });

    if (!articleText) {
        $('body p').each((i, elem) => {
            articleText += $(elem).text() + '\n\n';
        });
    }

    if (!articleText) {
        throw new Error('Could not extract article text.');
    }

    return articleText.trim();
}

// --- ENSURE THIS LINE IS CORRECT ---
module.exports = { scrapeArticle };