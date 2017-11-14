'use strict';

// Create Express app
const express = require('express');
const app = express();
const port = process.env.PORT || 8080;

// Static middleware
app.use(express.static('public'));

// Simple routing
app.get('/', function (_, res) {
    res.sendFile('index.html', { root: __dirname + '/public/' });
});

// Starting the server
app.listen(port);
console.log('Listening at http://localhost:' + port);
