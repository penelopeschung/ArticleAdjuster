// app.test.js
const request = require('supertest');

// 1. Explicitly mock the service file
// This guarantees adaptText is a jest.fn(), regardless of filenames or auto-mocking
const mockAdaptText = jest.fn();
jest.mock('./services/aiservice', () => ({
    adaptText: mockAdaptText
}));

// 2. Import app AFTER the mock
const app = require('./app');

describe('POST /api/adapt', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should return 200 and adapted text on success', async () => {
        // Arrange
        mockAdaptText.mockResolvedValue('Mocked Adapted Text');

        // Act
        const response = await request(app)
            .post('/api/adapt')
            .send({
                text: 'Hola',
                level: 'Novice Low'
            });

        // Assert
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({ adaptedText: 'Mocked Adapted Text' });
        expect(mockAdaptText).toHaveBeenCalledWith('Hola', 'Novice Low');
    });

    test('should return 400 if text is missing', async () => {
        const response = await request(app)
            .post('/api/adapt')
            .send({
                level: 'Novice Low'
                // text is missing
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toContain('Missing');
        
        // Use our explicit mock variable
        expect(mockAdaptText).not.toHaveBeenCalled();
    });

    test('should return 500 if the service throws an error', async () => {
        // Arrange
        mockAdaptText.mockRejectedValue(new Error('Something went wrong'));

        const response = await request(app)
            .post('/api/adapt')
            .send({ text: 'Hola', level: 'Novice Low' });

        expect(response.statusCode).toBe(500);
        expect(response.body.error).toContain('Something went wrong');
    });
});