const express = require('express');
const fs = require('fs');
const app = express();
const port = 3000;

app.use(express.static(__dirname));

app.get('/nodes', (req, res) => {
    fs.readFile('../data/nodes.json', (err, data) => {
        if (err) {
            res.status(500).send('Error reading nodes file');
        } else {
            res.send(JSON.parse(data));
        }
    });
});

app.get('/edges', (req, res) => {
    fs.readFile('../data/edges.json', (err, data) => {
        if (err) {
            res.status(500).send('Error reading edges file');
        } else {
            res.send(JSON.parse(data));
        }
    });
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});