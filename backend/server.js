// --- Imports ---
const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');

// --- Configuration ---
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
const MODEL_NAME = 'gemini-2.5-pro';

// --- Security: Configure CORS ---
const allowedOrigins = [
    process.env.FRONTEND_URL || 'https://article-adjuster-4447a3.netlify.app',
    'http://127.0.0.1:5500', // For VSC Live Server
    'http://localhost:5500' // For VSC Live Server
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
}));

// --- Middleware ---
app.use(express.json()); // To parse JSON request bodies

// --- Initialize Google AI Client ---
// this is now done on the server (more secure)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: MODEL_NAME });

// --- Prompt Library (copied from interact.js) ---
// this logic also moved to the backend/server
const promptLibrary = {
    "Novice Low": (text) => `
        Adapt the following Spanish text for a Novice Low (ACTFL) learner.
        - Use only the most common, high-frequency words.
        - Break down complex ideas into very short, simple sentences (3-5 words).
        - Use isolated words, lists, and memorized phrases.
        - The output should feel like basic building blocks of the language.
        - Do NOT include any English explanations. Respond ONLY with the adapted Spanish text.
        Original Text: "${text}"`,
    "Novice High": (text) => `
        Adapt the following Spanish text for a Novice High (ACTFL) learner.
        - Simplify vocabulary significantly, using words common to everyday life.
        - Structure the text using simple, learned sentences (e.g., Subject-Verb-Object).
        - Connect ideas with basic conjunctions like "y", "pero", and "porque".
        - The text should be understandable to someone who can ask and answer simple questions on familiar topics.
        - Do NOT include any English explanations. Respond ONLY with the adapted Spanish text.
        Original Text: "${text}"`,
    "Intermediate Low": (text) => `
        Adapt the following Spanish text for an Intermediate Low (ACTFL) learner.
        - Use a broad but common vocabulary. Avoid slang and highly idiomatic expressions.
        - Combine and recombine sentences. Create a mix of simple and compound sentences.
        - Ensure the text is mostly in the present tense, but introduce simple past (preterite) or future tenses if essential to the core meaning.
        - The text should be straightforward and easy to follow for someone who can create with the language.
        - Target a similar word count as the original. Respond ONLY with the adapted Spanish text.
        Original Text: "${text}"`,
    "Intermediate High": (text) => `
        Adapt the following Spanish text for an Intermediate High (ACTFL) learner.
        - Use varied and precise vocabulary. The learner should be able to understand the main ideas without a dictionary.
        - Create paragraph-length text. Use a variety of sentence structures and connecting words to show sequence and relationship (e.g., "entonces", "después", "sin embargo").
        - Confidently use major time frames (past, present, future) as needed to convey the original meaning.
        - The narrative should be clear and organized. Target a similar word count as the original.
        - Target a similar word count as the original. Respond ONLY with the adapted Spanish text.
        Original Text: "${text}"`,
    "Advanced Low": (text) => `
        Adapt the following Spanish text for an Advanced Low (ACTFL) learner.
        - Employ a rich and varied vocabulary, including some common idiomatic expressions.
        - Use complex sentence structures, including subordinate clauses. The flow should be smooth and natural.
        - The text must be a well-organized, paragraph-length narrative, describing events in detail across all major time frames.
        - Ensure good control of grammar and syntax. The text should be easily understood by a native speaker.
        - Target a similar word count as the original. Maintain the core message and tone of the original text. Respond ONLY with the adapted Spanish text.
        Original Text: "${text}"`,
    "Advanced High": (text) => `
        Adapt the following Spanish text for an Advanced High (ACTFL) learner.
        - Use sophisticated, low-frequency vocabulary and nuanced expressions appropriate to the topic.
        - Structure the text with complex, varied, and well-formed sentences. Use advanced grammatical structures, including the subjunctive mood where appropriate.
        - The text should be coherent, well-argued, and support opinions or hypotheses if present in the original.
        - Maintain the subtleties, tone, and register of the original source material.
        - The final text should demonstrate a high command of the language. Target a similar word count as the original.  Respond ONLY with the adapted Spanish text.
        Original Text: "${text}"`
};

function getPrompt(level, text) {
    const promptGenerator = promptLibrary[level];
    if (typeof promptGenerator === 'function') {
        return promptGenerator(text);
    }
    console.error(`No prompt generator found for level: ${level}`);
    return '';
}

// --- API Endpoints ---

/**
 * endpoint to adapt text.
 * recives: { "text": "...", "level": "..." }
 * returns: { "adaptedText": "..." }
 */
app.post('/api/adapt', async (req, res) => {
    try {
        const { text, level } = req.body;

        if (!text || !level) {
            return res.status(400).json({ error: 'Missing "text" or "level" in request body' });
        }

        const prompt = getPrompt(level, text);
        if (!prompt) {
            return res.status(400).json({ error: 'Invalid level provided' });
        }

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const adaptedText = response.text();

        res.json({ adaptedText: adaptedText.trim() });

    } catch (error) {
        console.error('Error in /api/adapt:', error);
        res.status(500).json({ error: 'Failed to adapt text. ' + error.message });
    }
});

/**
 * endpoint to scrape a URL.
 * recives: { "url": "..." }
 * returns: { "scrapedText": "..." }
 */
app.post('/api/scrape', async (req, res) => {
    try {
        const { url } = req.body;

        if (!url) {
            return res.status(400).json({ error: 'Missing "url" in request body' });
        }

        // fetch HTML from the URL
        // user-agent header to make it look more like a real browser
        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        // Load HTML into cheerio
        const $ = cheerio.load(data);

        // extract text from paragraph tags within common article containers
        let articleText = '';
        $('article p, main p').each((i, elem) => {
            articleText += $(elem).text() + '\n\n'; // add newlines for readability
        });

        // fallback if the first selector didn't find anything
        if (!articleText) {
            $('body p').each((i, elem) => {
                articleText += $(elem).text() + '\n\n';
            });
        }

        if (!articleText) {
             return res.status(404).json({ error: 'Could not extract article text. The site might be blocking scrapers or have an unusual structure.' });
        }

        res.json({ scrapedText: articleText.trim() });

    } catch (error) {
        console.error('Error in /api/scrape:', error);
        let errorMessage = 'Failed to scrape URL. ';
        if (error.response) {
            errorMessage += `Status: ${error.response.status}`; // e.g., 404, 403
        } else {
            errorMessage += error.message;
        }
        res.status(500).json({ error: errorMessage });
    }
});

// --- Start Server ---
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});