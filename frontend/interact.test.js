// interact.test.js

const fs = require('fs');
const path = require('path');

// Load the HTML file's content
const html = fs.readFileSync(path.resolve(__dirname, './index.html'), 'utf8');
jest.resetModules();
describe('Spanish Article Adapter', () => {

    beforeEach(() => {
        // --- ADD THIS LINE ---
        // 1. Reset Jest's module cache. This is the fix.
        jest.resetModules(); 
        // ---------------------

        // 2. Reset fetch mocks and DOM as before
        fetch.resetMocks();
        document.body.innerHTML = html;

        // 3. Mock window.alert as before
        window.alert = jest.fn();
        
        // 4. Load and run the script. This will now be a "fresh" run every time.
        require('./interact.js');
    });
    // --- Test the 'Fetch Article' Feature ---
    
    test('fetches and displays an article on success', async () => {
        // 1. Arrange
        // Mock a successful fetch response
        fetch.mockResponseOnce(JSON.stringify({ scrapedText: 'Mocked article text' }));

        // Get DOM elements
        const urlInput = document.getElementById('url-input');
        const fetchBtn = document.getElementById('fetch-btn');
        const textInput = document.getElementById('text-input');

        // 2. Act
        // Simulate user typing a URL and clicking
        urlInput.value = 'http://example.com';
        fetchBtn.click();

        // 3. Assert
        // Check loading state
        expect(textInput.value).toBe('Fetching article from URL, please wait...');
        expect(fetchBtn.disabled).toBe(true);

        // Wait for the async fetch call to complete
        await new Promise(process.nextTick);

        // Check final state
        expect(textInput.value).toBe('Mocked article text');
        expect(fetchBtn.disabled).toBe(false); // Check that it's re-enabled
        expect(fetch).toHaveBeenCalledWith('http://localhost:8000/api/scrape', expect.anything());
    });

    test('shows an error if fetching an article fails', async () => {
        // 1. Arrange
        // Mock a failed (e.g., 500) response
        fetch.mockResponseOnce(JSON.stringify({ error: 'Scraping failed' }), { status: 500 });
        
        const urlInput = document.getElementById('url-input');
        const fetchBtn = document.getElementById('fetch-btn');
        const textInput = document.getElementById('text-input');

        // 2. Act
        urlInput.value = 'http://example.com';
        fetchBtn.click();

        // 3. Assert
        await new Promise(process.nextTick); // Wait for fetch

        expect(textInput.value).toContain('Sorry, an error occurred: Scraping failed');
        expect(fetchBtn.disabled).toBe(false); // Check 'finally' block
    });

    test('shows an alert if URL is empty', () => {
        const fetchBtn = document.getElementById('fetch-btn');
        fetchBtn.click();
        expect(window.alert).toHaveBeenCalledWith('Please enter a URL first.');
    });


    // --- Test the 'Adapt Text' Feature ---

    test('adapts text on level button click', async () => {
        // 1. Arrange
        fetch.mockResponseOnce(JSON.stringify({ adaptedText: 'Texto adaptado' }));

        const textInput = document.getElementById('text-input');
        const textOutput = document.getElementById('text-output');
        const noviceLowBtn = document.querySelector('[data-level="Novice Low"]');
        
        // 2. Act
        // Simulate user pasting text and clicking a level
        textInput.value = 'Texto original';
        noviceLowBtn.click();

        // 3. Assert
        // Check loading state
        expect(textOutput.innerText).toBe('Adapting the text, please wait... This may take a few seconds.');

        await new Promise(process.nextTick); // Wait for fetch

        // Check final state
        expect(textOutput.innerText).toBe('Texto adaptado');
        // Check that fetch was called with the correct body
        expect(fetch).toHaveBeenCalledWith('http://localhost:8000/api/adapt', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: 'Texto original', level: 'Novice Low' })
        });
    });

    test('shows an alert if text input is empty on level click', () => {
        const textInput = document.getElementById('text-input');
        textInput.value = '   '; // Test with just whitespace
        
        const noviceLowBtn = document.querySelector('[data-level="Novice Low"]');
        noviceLowBtn.click();
        
        expect(window.alert).toHaveBeenCalledWith('Please enter some Spanish text into the box first.');
    });
});