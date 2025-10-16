const API_KEY = 'AIzaSyDhjn5A_5e-6CpRZqYFXu2KhBLkBd7yCB4'; 
const MODEL_NAME = 'gemini-2.5-pro';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;

// get references to htnl elements
const urlInput = document.getElementById('url-input');
const fetchBtn = document.getElementById('fetch-btn');
const textInput = document.getElementById('text-input');
const textOutput = document.getElementById('text-output');
const levelButtons = document.getElementById('level-buttons');

/**
 * @param {string} text  original spanish text
 * @param {string} level  target ACTFL level - intermediate, novice etc.
 */
async function adaptText(text, level) {
    textOutput.innerText = 'This may take a couple minutes, please wait... ';
// the prompt for my article
    const prompt = `Adapt the following Spanish text to a ${level} ACTFL level, maintaining the same word count. Simplify vocabulary and sentence structure, but keep the core meaning intact. Respond ONLY with the adapted Spanish text. Original Text: "${text}"`;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': API_KEY
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }]
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`API Error: ${errorData.error.message}`);
        }

        const data = await response.json();
        // access the text part of the response correctly
        const adaptedText = data.candidates[0].content.parts[0].text;
        textOutput.innerText = adaptedText.trim();

    } catch (error) {
        console.error('Error adapting text:', error);
        textOutput.innerText = `Sorry, an error occurred: ${error.message}`;
    }
}


// --- EVENT LISTENERS ---

/**
 * event listener for the level selection buttons 
 *  event delegation for efficiency
 */
levelButtons.addEventListener('click', (event) => {
    // ensure the clicked element is a button with the correct class
    if (event.target.classList.contains('level-btn')) {
        const text = textInput.value;
        const level = event.target.dataset.level; // gets buttons

        if (text.trim() === '') {
            alert('Please enter some text into the box first.');
            return; // stop the function if no text inputted
        }

        //  call the main adaptation function
        adaptText(text, level);
    }
});

/**
 * event listener for the Fetch Article button.
 * note: placeholder -- does not work right now
 */
fetchBtn.addEventListener('click', () => {
    alert('Note: Fetching from a URL is a complex feature. Due to browser security policies (CORS), this will not work for most websites without a server-side component. This button is a placeholder.');
    // would need server-side proxy to bypass CORS restrictions
});