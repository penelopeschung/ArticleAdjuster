// interact.test.js

const fs = require('fs');
const path = require('path');

// Load the HTML file's content
const html = fs.readFileSync(path.resolve(__dirname, './index.html'), 'utf8');
jest.resetModules();
describe('Spanish Article Adapter', () => {

    beforeEach(() => {
        jest.resetModules(); 

        fetch.resetMocks();
        document.body.innerHTML = html;

        window.alert = jest.fn();
        
        require('./interact.js');
    });
    // --- test fetch article ---
    
    test('fetches and displays an article on success', async () => {
        // a successful fetch response
        fetch.mockResponseOnce(JSON.stringify({ scrapedText: 'Mocked article text' }));

        // get DOM elements
        const urlInput = document.getElementById('url-input');
        const fetchBtn = document.getElementById('fetch-btn');
        const textInput = document.getElementById('text-input');

        // simultate user typing a URL and clicking
        urlInput.value = 'http://example.com';
        fetchBtn.click();

        // check loading state
        expect(textInput.value).toBe('Fetching article from URL, please wait...');
        expect(fetchBtn.disabled).toBe(true);

        // wait for  async fetch call to complete
        await new Promise(process.nextTick);

        // check final state
        expect(textInput.value).toBe('Mocked article text');
        expect(fetchBtn.disabled).toBe(false); // check that it's re-enabled
        expect(fetch).toHaveBeenCalledWith('http://localhost:8000/api/scrape', expect.anything());
    });

    test('shows an error if fetching an article fails', async () => {
        // mock failed (e.g., 500) response
        fetch.mockResponseOnce(JSON.stringify({ error: 'Scraping failed' }), { status: 500 });
        
        const urlInput = document.getElementById('url-input');
        const fetchBtn = document.getElementById('fetch-btn');
        const textInput = document.getElementById('text-input');

        urlInput.value = 'http://example.com';
        fetchBtn.click();

        await new Promise(process.nextTick); // wait for fetch

        expect(textInput.value).toContain('Sorry, an error occurred: Scraping failed');
        expect(fetchBtn.disabled).toBe(false); // check 'finally' block
    });

    test('shows an alert if URL is empty', () => {
        const fetchBtn = document.getElementById('fetch-btn');
        fetchBtn.click();
        expect(window.alert).toHaveBeenCalledWith('Please enter a URL first.');
    });


    // --- test the 'adapt text' feature ---

    test('adapts text on level button click', async () => {
        fetch.mockResponseOnce(JSON.stringify({ adaptedText: 'Texto adaptado' }));

        const textInput = document.getElementById('text-input');
        const textOutput = document.getElementById('text-output');
        const noviceLowBtn = document.querySelector('[data-level="Novice Low"]');
        
        // simulate user pasting text and clicking a level
        textInput.value = 'Texto original';
        noviceLowBtn.click();

        // check loading state
        expect(textOutput.innerText).toBe('Adapting the text, please wait... This may take a few seconds.');

        await new Promise(process.nextTick); // wait for fetch

        // check final state
        expect(textOutput.innerText).toBe('Texto adaptado');
        // check that fetch was called with the correct 
        expect(fetch).toHaveBeenCalledWith('http://localhost:8000/api/adapt', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: 'Texto original', level: 'Novice Low' })
        });
    });

    test('shows an alert if text input is empty on level click', () => {
        const textInput = document.getElementById('text-input');
        textInput.value = '   '; // test with just whitespace
        
        const noviceLowBtn = document.querySelector('[data-level="Novice Low"]');
        noviceLowBtn.click();
        
        expect(window.alert).toHaveBeenCalledWith('Please enter some Spanish text into the box first.');
    });
});