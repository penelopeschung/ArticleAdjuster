// backend/services/scraperservice.test.js
const axios = require('axios');
const { scrapeArticle } = require('./scraperservice');

// 1. Mock Axios so we don't hit real websites
jest.mock('axios');

describe('scraperservice', () => {
    
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should extract text from <article> tags', async () => {
        // Arrange: Fake HTML response
        const mockHtml = `
            <html>
                <body>
                    <article>
                        <p>This is paragraph 1.</p>
                        <p>This is paragraph 2.</p>
                    </article>
                </body>
            </html>
        `;
        axios.get.mockResolvedValue({ data: mockHtml });

        // Act
        const result = await scrapeArticle('http://fake-url.com');

        // Assert
        expect(result).toContain('This is paragraph 1.');
        expect(result).toContain('This is paragraph 2.');
        expect(axios.get).toHaveBeenCalledWith('http://fake-url.com', expect.anything());
    });

    test('should fallback to <body> tags if no article found', async () => {
        // Arrange: Fake HTML with no <article>, just <body>
        const mockHtml = `
            <html>
                <body>
                    <p>Fallback text.</p>
                </body>
            </html>
        `;
        axios.get.mockResolvedValue({ data: mockHtml });

        // Act
        const result = await scrapeArticle('http://fake-url.com');

        // Assert
        expect(result).toContain('Fallback text.');
    });

    test('should throw error if no text found', async () => {
        // Arrange: Empty HTML
        axios.get.mockResolvedValue({ data: '<html><body></body></html>' });

        // Act & Assert
        await expect(scrapeArticle('http://fake-url.com'))
            .rejects.toThrow('Could not extract article text');
    });

    test('should throw error if Axios fails (e.g. 404)', async () => {
        // Arrange: Network error
        axios.get.mockRejectedValue(new Error('Network Error'));

        // Act & Assert
        await expect(scrapeArticle('http://fake-url.com'))
            .rejects.toThrow('Network Error');
    });
});