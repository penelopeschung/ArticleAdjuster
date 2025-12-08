describe('Article Adjuster End-to-End', () => {

  beforeEach(() => {
    // vsit the Frontend
    // make sure live server is running on port 5500 before running this
    cy.visit('http://127.0.0.1:5500/frontend/index.html');
  });

  it('Happy Path: Should scrape a URL and then adapt the text', () => {
    //test scraping---
    
    // intercept the call to the backend scraper
// Intercept the call to the backend scraper
    cy.intercept('POST', 'http://localhost:8000/api/scrape', {
      delay: 500, 
      statusCode: 200,
      body: { scrapedText: 'This is the scraped text from a website.' }
    }).as('scrapeCall');

    // simulate user actions
    cy.get('#url-input').type('http://example.com/article');
    cy.get('#fetch-btn').click();

    cy.get('#text-input').should('have.value', 'Fetching article from URL, please wait...');

    // wait for intercepted call to happen
    cy.wait('@scrapeCall');

    // assert the text box now contains the result
    cy.get('#text-input').should('have.value', 'This is the scraped text from a website.');


    // --- test adapting ---

// Intercept the call to the backend adapter
    cy.intercept('POST', 'http://localhost:8000/api/adapt', {
      delay: 500, // <--- ADD THIS LINE HERE TOO
      statusCode: 200,
      body: { adaptedText: 'This is the simple version.' }
    }).as('adaptCall');

    // click the level button
    cy.contains('button', 'Novice Low').click();

    // assert loading state
    cy.get('#text-output').should('contain', 'Adapting the text');

    // wait for the API call
    cy.wait('@adaptCall');

    // assert final result
    cy.get('#text-output').should('contain', 'This is the simple version.');
  });

  it('Error Path: Should handle backend errors gracefully', () => {
    // pretend server crash
    cy.intercept('POST', 'http://localhost:8000/api/scrape', {
      statusCode: 500,
      body: { error: 'Server exploded' }
    }).as('scrapeFail');

    cy.get('#url-input').type('http://bad-url.com');
    cy.get('#fetch-btn').click();

    cy.wait('@scrapeFail');

    // check if the error message appears in the text box
    cy.get('#text-input').should('contain.value', 'Sorry, an error occurred');
  });
it('Validation: Should warn user if inputs are empty', () => {
    // 1. set up the spy
    const alertStub = cy.stub().as('alertStub');
    cy.on('window:alert', alertStub);

    // --- click fetch with empty url ---

    cy.get('#url-input').clear().should('have.value', ''); 
    
    cy.get('#fetch-btn').should('not.be.disabled').click();

    // check the alert
    cy.get('@alertStub').should('have.been.calledWith', 'Please enter a URL first.');

    // --- click level button with empty text ---
    
    cy.get('#text-input').clear().should('have.value', '');
    
    cy.contains('button', 'Advanced High').should('not.be.disabled').click();

    cy.get('@alertStub').should('have.been.calledWith', 'Please enter some Spanish text into the box first.');
  });
});