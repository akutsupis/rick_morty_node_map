const express = require('express');
const app = express();
const path = require('path');

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// API endpoints to serve data
app.get('/nodes', (req, res) => {
    res.sendFile(path.join(__dirname, 'nodes.json'));
});

app.get('/edges', (req, res) => {
    res.sendFile(path.join(__dirname, 'edges.json'));
});

// Start the server
const port = 3000;
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});