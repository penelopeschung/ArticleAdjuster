// services/aiservice.test.js

describe('aiservice', () => {
    let adaptText;
    let mockGeneratePro;
    let mockGenerateFlash;

    beforeEach(() => {
        // 1. Reset modules to ensure a fresh import for every test
        jest.resetModules();

        // 2. Create the mock functions
        mockGeneratePro = jest.fn();
        mockGenerateFlash = jest.fn();

        // 3. Define the mock implementation using doMock (not hoisted)
        jest.doMock('@google/generative-ai', () => {
            return {
                GoogleGenerativeAI: jest.fn().mockImplementation(() => {
                    return {
                        getGenerativeModel: jest.fn((options) => {
                            if (options.model.includes('flash')) {
                                return { generateContent: mockGenerateFlash };
                            }
                            return { generateContent: mockGeneratePro };
                        })
                    };
                })
            };
        });

        // 4. NOW import the service (it will use the mock we just defined)
        // Note: We use require() here because import statements are hoisted
        const service = require('./aiservice');
        adaptText = service.adaptText;
    });

    test('should return text from Pro model when successful', async () => {
        mockGeneratePro.mockResolvedValue({
            response: { text: () => 'Pro Adapted Text' }
        });

        const result = await adaptText('Hello', 'Novice Low');

        expect(result).toBe('Pro Adapted Text');
        expect(mockGeneratePro).toHaveBeenCalledTimes(1);
        expect(mockGenerateFlash).not.toHaveBeenCalled();
    });

    test('should fallback to Flash model when Pro hits rate limit', async () => {
        const rateLimitError = new Error('429 Too Many Requests');
        rateLimitError.status = 'RESOURCE_EXHAUSTED';

        mockGeneratePro.mockRejectedValue(rateLimitError);
        mockGenerateFlash.mockResolvedValue({
            response: { text: () => 'Flash Adapted Text' }
        });

        const result = await adaptText('Hello', 'Novice Low');

        expect(result).toBe('Flash Adapted Text');
        expect(mockGeneratePro).toHaveBeenCalledTimes(1);
        expect(mockGenerateFlash).toHaveBeenCalledTimes(1);
    });

    test('should throw error if Pro fails with non-rate-limit error', async () => {
        mockGeneratePro.mockRejectedValue(new Error('Invalid API Key'));

        await expect(adaptText('Hello', 'Novice Low'))
            .rejects.toThrow('Invalid API Key');
        
        expect(mockGenerateFlash).not.toHaveBeenCalled();
    });
});