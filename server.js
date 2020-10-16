'use strict'

const express = require('express');
const cors = require('cors');
const { response } = require('express');
require('dotenv').config();
const PORT = process.env.PORT || 3000;
const app = express();
app.use(cors());


// Routes
app.get('/location', handleLocation);
app.get('/weather', handleWeather);


// Handlers
function handleLocation(request, response){
    try {
        const data = require('./data/location.json')[0];
        const city = request.query.city;
        const location = new Location(data, city);
        response.send(location);
    }
    catch (error) {
        handleError();
    }
};

function handleWeather(request, response){
    try {
        const data = require('./data/weather.json').data;
        let weather = [];
        data.forEach(data => weather.push(new Weather(data)));
        response.send(weather);
    }
    catch (error) {
        handleError();
    }
};

function handleError(){
    return response.status(500).send("Sorry, something went wrong");
};

// Constructors
function Location(obj, query){ //location constructor
    this.search_query = query;
    this.formatted_query = obj.display_name;
    this.latitude = obj.lat;
    this.longitude = obj.lon;
};

function Weather(obj){ //weather constructor
    this.forecast = obj.weather.description;
    this.time = new Date(obj.valid_date).toDateString();
}

// Start the server
app.listen(PORT, () => {
    console.log(`Server now listening on port ${PORT}`);
});