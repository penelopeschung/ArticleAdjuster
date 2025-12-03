// backend/app.test.js
const request = require('supertest');

describe('App Integration Tests', () => {
    let app;
    let mockAdaptText;
    let mockScrapeArticle;

    beforeEach(() => {
        // 1. Reset modules to clear the cache
        jest.resetModules();

        // 2. Create the mock functions
        mockAdaptText = jest.fn();
        mockScrapeArticle = jest.fn();

        // 3. Define the mocks BEFORE importing the app
        jest.doMock('./services/aiservice', () => ({
            adaptText: mockAdaptText
        }));

        jest.doMock('./services/scraperservice', () => ({
            scrapeArticle: mockScrapeArticle
        }));

        // 4. Import the app (it will now use the mocks we just defined)
        app = require('./app');
    });

    // --- ADAPT TESTS ---
    describe('POST /api/adapt', () => {
        test('should return 200 and adapted text on success', async () => {
            mockAdaptText.mockResolvedValue('Mocked Adapted Text');
            
            const response = await request(app)
                .post('/api/adapt')
                .send({ text: 'Hola', level: 'Novice Low' });

            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual({ adaptedText: 'Mocked Adapted Text' });
        });

        test('should return 400 if text is missing', async () => {
            const response = await request(app).post('/api/adapt').send({ level: 'Novice Low' });
            expect(response.statusCode).toBe(400);
        });

        test('should return 500 if service fails', async () => {
            mockAdaptText.mockRejectedValue(new Error('AI Failed'));
            
            const response = await request(app)
                .post('/api/adapt')
                .send({ text: 'Hola', level: 'Novice Low' });
            
            expect(response.statusCode).toBe(500);
        });
    });

    // --- SCRAPE TESTS ---
    describe('POST /api/scrape', () => {
        test('should return 200 and scraped text on success', async () => {
            mockScrapeArticle.mockResolvedValue('Scraped Article Content');

            const response = await request(app)
                .post('/api/scrape')
                .send({ url: 'http://example.com' });

            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual({ scrapedText: 'Scraped Article Content' });
            expect(mockScrapeArticle).toHaveBeenCalledWith('http://example.com');
        });

        test('should return 400 if url is missing', async () => {
            const response = await request(app).post('/api/scrape').send({});
            expect(response.statusCode).toBe(400);
            expect(response.body.error).toContain('Missing');
        });

        test('should return 500 if scraper fails', async () => {
            mockScrapeArticle.mockRejectedValue(new Error('Scraper Failed'));
            
            const response = await request(app)
                .post('/api/scrape')
                .send({ url: 'http://bad-url.com' });
            
            expect(response.statusCode).toBe(500);
        });
    });
});