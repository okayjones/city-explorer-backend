'use strict'

// Dependencies
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');

// Environment 
require('dotenv').config();

// Setup application
const PORT = process.env.PORT || 3000;
const app = express();
app.use(cors());

// Routes
app.get('/location', handleLocation);
app.get('/weather', handleWeather);
app.use('*', notFoundHandler);

// Handlers
function handleLocation(req, res){
    let city = req.query.city;
    let key = process.env.GEOCODE_API_KEY;
    
    const URL = `https://us1.locationiq.com/v1/search.php/?key=${key}&q=${city}&format=json`;
    superagent.get(URL)
        .then(data => {
            let location = new Location(data.body[0], city);
            res.status(200).json(location);
        })
        .catch(error => {
            res.status(500).send("Sorry, something went wrong");
        })
};

function handleWeather(req, res){
    try {
        const data = require('./data/weather.json').data;
        let weather = data.map(day => new Weather(day));
        res.send(weather);
    }
    catch (error) {
        res.status(500).send("Sorry, something went wrong");
    }
};

function notFoundHandler(req, res){
    res.status(404).send('Not Found');
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