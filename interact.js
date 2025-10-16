const API_KEY = 'AIzaSyDhjn5A_5e-6CpRZqYFXu2KhBLkBd7yCB4'; 
const MODEL_NAME = 'gemini-2.5-pro';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;

// --- DOM Element References ---
const fetchBtn = document.getElementById('fetch-btn');
const textInput = document.getElementById('text-input');
const textOutput = document.getElementById('text-output');
const levelButtons = document.getElementById('level-buttons');

// --- Prompt Library (Corrected) ---
// Each prompt is now a function that takes 'text' as an argument.
// This ensures the user's text is correctly inserted into the prompt string.
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

/**
 * Generates a prompt by calling the appropriate function from the library.
 * @param {string} level - The target ACTFL level (e.g., "Novice Low").
 * @param {string} text - The original Spanish text.
 * @returns {string} The customized prompt for the API.
 */
function getPrompt(level, text) {
    const promptGenerator = promptLibrary[level];
    if (typeof promptGenerator === 'function') {
        // Call the function for the selected level and pass the text to it.
        return promptGenerator(text);
    }
    // Fallback in case the level doesn't exist.
    console.error(`No prompt generator found for level: ${level}`);
    return '';
}


/**
 * @param {string} text  The original Spanish text.
 * @param {string} level The target ACTFL level.
 */
async function adaptText(text, level) {
    textOutput.innerText = 'Adapting the text, please wait... This may take a few seconds.';

    const prompt = getPrompt(level, text);
    if (!prompt) { // Stop if the prompt couldn't be generated
        textOutput.innerText = 'Error: Could not generate a valid prompt for the selected level.';
        return;
    }

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }],
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            const errorMessage = errorData.error?.message || `HTTP error! Status: ${response.status}`;
            throw new Error(errorMessage);
        }

        const data = await response.json();
        
        if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0]) {
             const adaptedText = data.candidates[0].content.parts[0].text;
             textOutput.innerText = adaptedText.trim();
        } else {
            // This handles cases where the model might refuse to answer (e.g., safety settings)
            const finishReason = data.candidates?.[0]?.finishReason;
            if (finishReason) {
                 throw new Error(`API call finished unexpectedly. Reason: ${finishReason}`);
            } else {
                 throw new Error("Received an unexpected or empty response format from the API.");
            }
        }

    } catch (error) {
        console.error('Error adapting text:', error);
        textOutput.innerText = `Sorry, an error occurred: ${error.message}`;
    }
}


// --- EVENT LISTENERS ---

levelButtons.addEventListener('click', (event) => {
    // Ensure the click is on a button and not the container div
    if (event.target.tagName === 'BUTTON' && event.target.classList.contains('level-btn')) {
        const text = textInput.value;
        const level = event.target.dataset.level;

        if (text.trim() === '') {
            alert('Please enter some Spanish text into the box first.');
            return;
        }
        adaptText(text, level);
    }
});


fetchBtn.addEventListener('click', () => {
    alert('Note: Fetching directly from a URL requires a server-side component to handle web scraping and avoid browser security (CORS) errors. This button is a placeholder.');
});