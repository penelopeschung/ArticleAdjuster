// app.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { adaptText } = require('./services/aiservice'); // Import your service

const app = express();

// Middleware
app.use(express.json());
app.use(cors({ /* ... your CORS options ... */ }));

// Routes (Controller Logic)
app.post('/api/adapt', async (req, res) => {
    try {
        const { text, level } = req.body;
        if (!text || !level) return res.status(400).json({ error: 'Missing data' });

        // Call the service
        const adaptedText = await adaptText(text, level);
        
        res.json({ adaptedText });
    } catch (error) {
        // Handle service errors
        if (error.message === 'Invalid level provided') {
             return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: error.message });
    }
});

// app.post('/api/scrape', ... same pattern ...);

module.exports = app;