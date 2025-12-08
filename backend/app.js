// backend/app.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { adaptText } = require('./services/aiservice'); 
const { scrapeArticle } = require('./services/scraperservice'); // <--- Import Scraper

const app = express();

// --- configuration ---
const allowedOrigins = [
    'http://127.0.0.1:5500',
    'http://localhost:5500',
    'http://localhost:8000',
    'https://article-adjuster.vercel.app' 
];

app.use(express.json());
app.use(cors({
    origin: function (origin, callback) {
        // allowing requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1 || origin.includes('vercel.app')) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
}));
app.use(express.json());
app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
}));


// adapt Text Route
app.post('/api/adapt', async (req, res) => {
    try {
        const { text, level } = req.body;
        if (!text || !level) return res.status(400).json({ error: 'Missing "text" or "level"' });

        const adaptedText = await adaptText(text, level);
        res.json({ adaptedText });

    } catch (error) {
        console.error('Error in /api/adapt:', error);
        res.status(500).json({ error: 'Failed to adapt text. ' + error.message });
    }
});

// scrape route 
app.post('/api/scrape', async (req, res) => {
    try {
        const { url } = req.body;
        if (!url) return res.status(400).json({ error: 'Missing "url"' });

        const scrapedText = await scrapeArticle(url);
        res.json({ scrapedText });

    } catch (error) {
        console.error('Error in /api/scrape:', error);
        res.status(500).json({ error: 'Failed to scrape URL. ' + error.message });
    }
});

module.exports = app;