// services/aiService.js
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize clients (Dependency Injection is better, but this is fine for now)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const proModel = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });
const flashModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// Your prompt library
const promptLibrary = {
    "Novice Low": (text) => `Adapt the following Spanish text for a Novice Low (ACTFL) learner.
       - Use only the most common, high-frequency words.
       - Break down complex ideas into very short, simple sentences (3-5 words).
       - Use isolated words, lists, and memorized phrases.
       - The output should feel like basic building blocks of the language.
       - Do NOT include any English explanations. Respond ONLY with the adapted Spanish text.
       Original Text: "${text}"`,
    "Novice High": (text) => `Adapt the following Spanish text for a Novice High (ACTFL) learner.
       - Simplify vocabulary significantly, using words common to everyday life.
       - Structure the text using simple, learned sentences (e.g., Subject-Verb-Object).
       - Connect ideas with basic conjunctions like "y", "pero", and "porque".
       - The text should be understandable to someone who can ask and answer simple questions on familiar topics.
       - Do NOT include any English explanations. Respond ONLY with the adapted Spanish text.
       Original Text: "${text}"`,
    "Intermediate Low": (text) => `Adapt the following Spanish text for an Intermediate Low (ACTFL) learner.
       - Use a broad but common vocabulary. Avoid slang and highly idiomatic expressions.
       - Combine and recombine sentences. Create a mix of simple and compound sentences.
       - Ensure the text is mostly in the present tense, but introduce simple past (preterite) or future tenses if essential to the core meaning.
       - The text should be straightforward and easy to follow for someone who can create with the language.
       - Target a similar word count as the original. Respond ONLY with the adapted Spanish text.
       Original Text: "${text}"`,
    "Intermediate High": (text) => `Adapt the following Spanish text for an Intermediate High (ACTFL) learner.
       - Use varied and precise vocabulary. The learner should be able to understand the main ideas without a dictionary.
       - Create paragraph-length text. Use a variety of sentence structures and connecting words to show sequence and relationship (e.g., "entonces", "después", "sin embargo").
       - Confidently use major time frames (past, present, future) as needed to convey the original meaning.
       - The narrative should be clear and organized. Target a similar word count as the original.
       - Target a similar word count as the original. Respond ONLY with the adapted Spanish text.
       Original Text: "${text}"`,
    "Advanced Low": (text) => `Adapt the following Spanish text for an Advanced Low (ACTFL) learner.
       - Employ a rich and varied vocabulary, including some common idiomatic expressions.
       - Use complex sentence structures, including subordinate clauses. The flow should be smooth and natural.
       - The text must be a well-organized, paragraph-length narrative, describing events in detail across all major time frames.
       - Ensure good control of grammar and syntax. The text should be easily understood by a native speaker.
       - Target a similar word count as the original. Maintain the core message and tone of the original text. Respond ONLY with the adapted Spanish text.
       Original Text: "${text}"`,
    "Advanced High": (text) => `Adapt the following Spanish text for an Advanced High (ACTFL) learner.
       - Use sophisticated, low-frequency vocabulary and nuanced expressions appropriate to the topic.
       - Structure the text with complex, varied, and well-formed sentences. Use advanced grammatical structures, including the subjunctive mood where appropriate.
       - The text should be coherent, well-argued, and support opinions or hypotheses if present in the original.
       - Maintain the subtleties, tone, and register of the original source material.
       - The final text should demonstrate a high command of the language. Target a similar word count as the original.  Respond ONLY with the adapted Spanish text.
       Original Text: "${text}"`,
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
            console.warn('The rate limit for the more comprehensive model was hit so model will be switched to a quicker flash version. Please try again in a couple minutes if you would like the higher quality version.');
            result = await flashModel.generateContent(prompt);
        } else {
            throw error;
        }
    }

    const response = await result.response;
    return response.text().trim();
}

module.exports = { adaptText };