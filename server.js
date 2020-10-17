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
app.get('/trails', handleTrails)
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

function handleTrails(req, res){
    let lat = req.query.latitude;
    let lon = req.query.longitude;
    let key = process.env.TRAIL_API_KEY;

    const URL = `https://www.hikingproject.com/data/get-trails?lat=${lat}&lon=${lon}&maxDistance=10&key=${key}`;

    superagent.get(URL)
        .then(data => {
            let trails = data.body.trails.map(trail => new Trail(trail));
            res.status(200).send(trails);
        })
        .catch(error => {
            errorHandler();
        })
};

function notFoundHandler(req, res){
    res.status(404).send('Not Found');
};

function errorHandler(req, res){
    res.status(500).send("Sorry, something went wrong");
};

// Constructors
function Location(obj, query){
    this.search_query = query;
    this.formatted_query = obj.display_name;
    this.latitude = obj.lat;
    this.longitude = obj.lon;
};

function Weather(obj){
    this.forecast = obj.weather.description;
    this.time = new Date(obj.valid_date).toDateString();
};

function Trail(obj){
    this.name = obj.name;
    this.location = obj.location;
    this.length = obj.length;
    this.stars = obj.stars;
    this.star_votes = obj.starVotes;
    this.summary = obj.summary;
    this.trail_url = obj.url;
    this.conditions = obj.conditionStatus;
    this.condition_date = new Date(obj.conditionDate).toDateString();
    this.condition_time = new Date(obj.conditionDate).toLocaleTimeString();
};

// Start the server
app.listen(PORT, () => {
    console.log(`Server now listening on port ${PORT}`);
});