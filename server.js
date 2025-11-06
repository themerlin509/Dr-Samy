const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = process.env.PORT || 10000;

// This middleware serves all the static files (js, css, images, etc.) from the current directory
app.use(express.static(__dirname));

const indexHtmlPath = path.join(__dirname, 'index.html');

// This route matches any path that does NOT contain a dot, and serves the app.
// It's a direct translation of the vercel.json rewrite rule `/:path((?!.*\\.).*)`
// and ensures that client-side routes are handled by the React app.
app.get(/^((?!\.).)*$/, (req, res) => {
    // Check if index.html exists before sending
    fs.access(indexHtmlPath, fs.constants.F_OK, (err) => {
        if (err) {
            console.error('Error: index.html not found.', { path: indexHtmlPath });
            res.status(404).send('Application entry point not found.');
            return;
        }
        res.sendFile(indexHtmlPath);
    });
});


app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
