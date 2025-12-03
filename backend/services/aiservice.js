// services/aiService.js
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize clients (Dependency Injection is better, but this is fine for now)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const proModel = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });
const flashModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// Your prompt library
const promptLibrary = {
    "Novice Low": (text) => `... prompt logic ...`,
    // ... other levels
};

/**
 * Pure business logic: Adapts text using Gemini with fallback
 */
async function adaptText(text, level) {
    if (!promptLibrary[level]) {
        throw new Error('Invalid level provided');
    }
    
    const prompt = promptLibrary[level](text);
    let result;

    try {
        result = await proModel.generateContent(prompt);
    } catch (error) {
        // Fallback logic
        if (error.status === 'RESOURCE_EXHAUSTED' || (error.message && error.message.includes('429'))) {
            console.warn('Rate limit hit. Using Flash model.');
            result = await flashModel.generateContent(prompt);
        } else {
            throw error;
        }
    }

    const response = await result.response;
    return response.text().trim();
}

module.exports = { adaptText };