// backend/server.js
const app = require('./app');
const PORT = process.env.PORT || 8000;

// 1. Export the app for Vercel (Serverless)
module.exports = app;

// 2. Only start the server manually if we are running LOCALLY
// (Vercel sets require.main to something else, so this won't run there)
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}