// backend/server.js
const app = require('./app');
const PORT = process.env.PORT || 8000;

// export app for serverless vercel
module.exports = app;

// 2. Only start the server manually if we are running LOCALLY
// (Vercel sets require.main to something else, so this won't run there)
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}