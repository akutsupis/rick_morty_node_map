const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// Endpoint to serve the JSON data
app.get('/data', (req, res) => {
    const filePath = path.join(__dirname, '../data/rick-and-morty-data.json');

    fs.readFile(filePath, (err, data) => {
        if (err) {
            console.error('Failed to read data file:', err);
            return res.status(500).send('Failed to load data.');
        }
        res.send(JSON.parse(data));
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});