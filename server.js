'use strict'

const express = require('express');
const cors = require('cors');
require('dotenv').config();
const PORT = process.env.PORT || 3000;
const app = express();
app.use(cors());


// Routes
app.get('/', (request, response) => {
    console.log('Hello world, this is the home route!');
});

app.get('/location', (request, response) => {
    const data = require('./data/location.json')[0];
    const city = request.query.city;

    //call constructor
    const location = new Location(data, city);
    
    //send response
    response.send(location);
});


function Location(obj, query){ //location constructor
    this.search_query = query;
    this.formatted_query = obj.display_name;
    this.latitude = obj.lat;
    this.longitude = obj.lon;
};

app.listen(PORT, () => {
    console.log(`Server now listening on port ${PORT}`);
});