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
            errorHandler();
        })
};

function handleWeather(req, res){
    let lat = req.query.latitude;
    let lon = req.query.longitude;
    let key = process.env.WEATHER_API_KEY;

    const URL = `https://api.weatherbit.io/v2.0/forecast/daily?lat=${lat}&lon=${lon}&days=8&key=${key}`;

    superagent.get(URL)
        .then(data => {
            let weather = data.body.data.map(day => new Weather(day));
            res.status(200).send(weather);
        })
        .catch(error => {
            errorHandler(req, res);
        });
};

function notFoundHandler(req, res){
    res.status(404).send('Not Found');
};

function errorHandler(req, res){
    res.status(500).send("Sorry, something went wrong");
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