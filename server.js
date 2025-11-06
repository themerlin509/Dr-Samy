const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = process.env.PORT || 10000;

// This middleware serves all the static files (js, css, images, etc.) from the current directory
app.use(express.static(__dirname));

const indexHtmlPath = path.join(__dirname, 'index.html');
let indexHtmlContent;

try {
  indexHtmlContent = fs.readFileSync(indexHtmlPath, 'utf8');
} catch (err) {
  console.error('Fatal: Could not read index.html file. Make sure it exists in the root directory.', err);
  process.exit(1);
}

const apiKey = process.env.API_KEY || '';
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';

if (!apiKey || !supabaseUrl || !supabaseKey) {
    console.warn("WARNING: One or more environment variables (API_KEY, SUPABASE_URL, SUPABASE_KEY) are not set. The application may not function correctly.");
}

const injectionScript = `<script>
  window.process = { 
    env: { 
      API_KEY: "${apiKey}",
      SUPABASE_URL: "${supabaseUrl}",
      SUPABASE_KEY: "${supabaseKey}"
    } 
  };
</script>`;

const injectedHtml = indexHtmlContent.replace('</head>', `${injectionScript}\n</head>`);


// This route matches any path that does NOT contain a dot, and serves the app.
// It's a direct translation of the vercel.json rewrite rule `/:path((?!.*\\.).*)`
// and ensures that client-side routes are handled by the React app.
app.get(/^((?!\.).)*$/, (req, res) => {
    res.send(injectedHtml);
});


app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
