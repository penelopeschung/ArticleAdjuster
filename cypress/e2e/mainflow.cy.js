describe('Article Adjuster End-to-End', () => {

  beforeEach(() => {
    // 1. Visit the Frontend
    // MAKE SURE your "Live Server" is running on port 5500 before running this!
    cy.visit('http://127.0.0.1:5500/frontend/index.html');
  });

  it('Happy Path: Should scrape a URL and then adapt the text', () => {
    // --- STEP 1: Test Scraping ---
    
    // Intercept the call to the backend scraper
// Intercept the call to the backend scraper
    cy.intercept('POST', 'http://localhost:8000/api/scrape', {
      delay: 500, // <--- ADD THIS LINE (wait 0.5 seconds before replying)
      statusCode: 200,
      body: { scrapedText: 'This is the scraped text from a website.' }
    }).as('scrapeCall');

    // Simulate User Actions
    cy.get('#url-input').type('http://example.com/article');
    cy.get('#fetch-btn').click();

    // Assert UI changes while loading
    cy.get('#text-input').should('have.value', 'Fetching article from URL, please wait...');

    // Wait for our intercepted call to happen
    cy.wait('@scrapeCall');

    // Assert the text box now contains the result
    cy.get('#text-input').should('have.value', 'This is the scraped text from a website.');


    // --- STEP 2: Test Adapting ---

// Intercept the call to the backend adapter
    cy.intercept('POST', 'http://localhost:8000/api/adapt', {
      delay: 500, // <--- ADD THIS LINE HERE TOO
      statusCode: 200,
      body: { adaptedText: 'This is the simple version.' }
    }).as('adaptCall');

    // Click the level button
    cy.contains('button', 'Novice Low').click();

    // Assert loading state
    cy.get('#text-output').should('contain', 'Adapting the text');

    // Wait for the API call
    cy.wait('@adaptCall');

    // Assert final result
    cy.get('#text-output').should('contain', 'This is the simple version.');
  });

  it('Error Path: Should handle backend errors gracefully', () => {
    // Mock a server crash (500 error)
    cy.intercept('POST', 'http://localhost:8000/api/scrape', {
      statusCode: 500,
      body: { error: 'Server exploded' }
    }).as('scrapeFail');

    cy.get('#url-input').type('http://bad-url.com');
    cy.get('#fetch-btn').click();

    cy.wait('@scrapeFail');

    // Check if the error message appears in the text box
    cy.get('#text-input').should('contain.value', 'Sorry, an error occurred');
  });
it('Validation: Should warn user if inputs are empty', () => {
    // 1. Set up the spy
    const alertStub = cy.stub().as('alertStub');
    cy.on('window:alert', alertStub);

    // --- Test 1: Click Fetch with empty URL ---
    
    // Clear the input AND assert it is empty. 
    // This forces Cypress to wait until the clear action is 100% done.
    cy.get('#url-input').clear().should('have.value', ''); 
    
    // Ensure button is ready to be clicked
    cy.get('#fetch-btn').should('not.be.disabled').click();

    // Check the alert
    cy.get('@alertStub').should('have.been.calledWith', 'Please enter a URL first.');

    // --- Test 2: Click Level Button with empty text ---
    
    // Clear and Assert
    cy.get('#text-input').clear().should('have.value', '');
    
    cy.contains('button', 'Advanced High').should('not.be.disabled').click();

    // Check the alert
    cy.get('@alertStub').should('have.been.calledWith', 'Please enter some Spanish text into the box first.');
  });
});