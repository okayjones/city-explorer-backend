'use strict'

const express = require('express');
const cors = require('cors');
require('dotenv').config();
const PORT = process.env.PORT || 3000;
const app = express();
app.use(cors());

app.get('/', (request, response) => {
    console.log('Hello world, this is the home route!');
});

app.listen(PORT, () => {
    console.log(`Server now listening on port ${PORT}`);
});