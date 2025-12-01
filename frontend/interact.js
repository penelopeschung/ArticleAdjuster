// --- Configuration ---
//backend url
const API_BASE_URL = 'http://localhost:8000'; 

// --- DOM element references ---
const fetchBtn = document.getElementById('fetch-btn');
const urlInput = document.getElementById('url-input');
const textInput = document.getElementById('text-input');
const textOutput = document.getElementById('text-output');
const levelButtons = document.getElementById('level-buttons');

/**
calls the backend server to adapt the text
* @param {string} text   original spanish text
* @param {string} level the ACTFL level it needs to be
*/
async function adaptText(text, level) {
    textOutput.innerText = 'Adapting the text, please wait... This may take a few seconds.';

    try {
        const response = await fetch(`${API_BASE_URL}/api/adapt`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text: text,
                level: level
            })
        });

        const data = await response.json();

        if (!response.ok) {
            // display error message
            throw new Error(data.error || `HTTP error! Status: ${response.status}`);
        }

        // serveresponds with { adaptedText: "..." }
        textOutput.innerText = data.adaptedText;

    } catch (error) {
        console.error('Error adapting text:', error);
        textOutput.innerText = `Sorry, an error occurred: ${error.message}`;
    }
}

/**
 * calls backend server to scrape text from a the URL
 */
async function fetchArticleFromURL() {
    const url = urlInput.value;
    if (!url) {
        alert('Please enter a URL first.');
        return;
    }

    textInput.value = 'Fetching article from URL, please wait...';
    fetchBtn.disabled = true;

    try {
        const response = await fetch(`${API_BASE_URL}/api/scrape`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url: url })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || `HTTP error! Status: ${response.status}`);
        }

        // server responds with { scrapedText: "..." }
        textInput.value = data.scrapedText;

    } catch (error) {
        console.error('Error fetching URL:', error);
        textInput.value = `Sorry, an error occurred: ${error.message}\n\nNote: Many sites block scraping. Try copying and pasting the text instead.`;
    } finally {
        fetchBtn.disabled = false;
    }
}

// --- event listeners ---
levelButtons.addEventListener('click', (event) => {
    //button click
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

fetchBtn.addEventListener('click', fetchArticleFromURL);