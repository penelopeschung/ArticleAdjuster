const API_KEY = '0912586309acc7e6dedce35a6ac0eae1bca35315'; 
const MODEL_NAME = 'gemini-1.5-pro'; 
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;

// Get references to  HTML elements
const urlInput = document.getElementById('url-input');
const fetchBtn = document.getElementById('fetch-btn');
const textInput = document.getElementById('text-input');
const textOutput = document.getElementById('text-output');
const levelButtons = document.getElementById('level-buttons');




async function adaptText(text, level) {
    textOutput.innerText = 'Adapting text with Gemini, please wait...';
    
    //  prompt is the same, but request structure is different
    const prompt = `Adapt the following Spanish text to a ${level} CEFR level. Simplify vocabulary and sentence structure, but keep the core meaning intact. The adapted text must be in Spanish. Original Text: "${text}" Adapted Text:`;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
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
        
        const adaptedText = data.candidates[0].content.parts[0].text;
        
        textOutput.innerText = adaptedText.trim();

    } catch (error) {
        console.error('Error adapting text:', error);
        textOutput.innerText = `Sorry, an error occurred: ${error.message}`;
    }
}