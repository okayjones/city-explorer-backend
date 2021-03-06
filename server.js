'use strict'

// Dependencies
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
const pg = require('pg');

// Environment 
require('dotenv').config();

// Postgres client
const client = new pg.Client(process.env.DATABASE_URL);

// Setup application
const PORT = process.env.PORT || 3000;
const app = express();
app.use(cors());

// Routes
app.get('/location', handleLocation);
app.get('/weather', handleWeather);
app.get('/trails', handleTrails);
app.get('/movies', handleMovies);
app.get('/yelp', handleYelp);
app.use('*', notFoundHandler);

// Handlers
function handleLocation(req, res) {
    const city = req.query.city;
    const URL = 'https://us1.locationiq.com/v1/search.php/';
    const sqlQuery = `SELECT * FROM location WHERE search_query=$1`;
    const sqlInsert = `INSERT INTO location (search_query, formatted_query, latitude, longitude) VALUES ($1,$2,$3,$4)`;
    const queryParams = {
        key: process.env.GEOCODE_API_KEY,
        q: city,
        format: 'json'
    };

    client.query(sqlQuery, [city])
        .then(result => {
            if (result.rowCount) {
                res.status(200).json(result.rows[0])
            }
            else {
                superagent.get(URL)
                    .query(queryParams)
                    .then(data => {
                        let loc = new Location(data.body[0], city);
                        client.query(sqlInsert, [loc.search_query, loc.formatted_query, loc.latitude, loc.longitude])
                            .then(results => res.status(200).json(loc));
                    });
            };
        })
        .catch(error => errorHandler(req, res, error));
};

function handleWeather(req, res) {
    const URL = 'https://api.weatherbit.io/v2.0/forecast/daily';
    const queryParams = {
        lat: req.query.latitude,
        lon: req.query.longitude,
        key: process.env.WEATHER_API_KEY
    };

    superagent.get(URL)
        .query(queryParams)
        .then(data => {
            let weather = data.body.data.map(day => new Weather(day));
            res.status(200).send(weather);
        })
        .catch(error => errorHandler(req, res, error));
};

function handleTrails(req, res) {
    const URL = 'https://www.hikingproject.com/data/get-trails';
    const queryParams = {
        lat: req.query.latitude,
        lon: req.query.longitude,
        maxDistance: 10,
        key: process.env.TRAIL_API_KEY
    };

    superagent.get(URL)
        .query(queryParams)
        .then(data => {
            let trails = data.body.trails.map(trail => new Trail(trail));
            res.status(200).send(trails);
        })
        .catch(error => errorHandler(req, res, error));
};

function handleMovies(req, res) {
    const imgBaseUrl = 'https://image.tmdb.org/t/p/w500';
    const API = 'https://api.themoviedb.org/3/search/movie/'
    const queryParams = {
        api_key: process.env.MOVIE_API_KEY,
        language: 'en-US',
        query: req.query.search_query,
        page: 1,
        include_adult: false
    };

    superagent.get(API)
        .query(queryParams)
        .then(data => {
            let movies = data.body.results.map(movie => new Movie(movie, imgBaseUrl));
            res.status(200).send(movies);
        })
        .catch(error => errorHandler(req, res, error));
}

function handleYelp(req, res) {
    const API = 'https://api.yelp.com/v3/businesses/search';
    const numResults = 5;
    const page = req.query.page || 1;
    const queryParams = {
        term: 'restaurants',
        latitude: req.query.latitude,
        longitude: req.query.longitude,
        limit: numResults,
        offset: ((page - 1) * numResults + 1)
    };

    superagent.get(API)
        .auth(process.env.YELP_API_KEY, { type: 'bearer' })
        .query(queryParams)
        .then(data => {
            let restaurants = data.body.businesses.map(place => new Restaurant(place));;
            res.status(200).send(restaurants);
        })
        .catch(error => errorHandler(req, res, error));
}

function notFoundHandler(req, res) {
    res.status(404).send('Not Found');
};

function errorHandler(req, res, err) {
    console.log('ERROR:', err)
    res.status(500).send("Sorry, something went wrong");
};

// Constructors
function Location(obj, query) {
    this.search_query = query;
    this.formatted_query = obj.display_name;
    this.latitude = obj.lat;
    this.longitude = obj.lon;
};

function Weather(obj) {
    this.forecast = obj.weather.description;
    this.time = new Date(obj.valid_date).toDateString();
};

function Trail(obj) {
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

function Movie(obj, imgBaseUrl) {
    this.title = obj.title;
    this.overview = obj.overview;
    this.average_votes = obj.vote_average;
    this.total_votes = obj.vote_count; 
    this.image_url = (obj.poster_path) ? `${imgBaseUrl}${obj.poster_path}` : undefined;
    this.popularity = obj.popularity;
    this.released_on = obj.release_date;
};

function Restaurant(obj) {
    this.name = obj.name;
    this.image_url = obj.image_url;
    this.price = obj.price;
    this.rating = obj.rating;
    this.url = obj.url;
};

// Connect to DB and start server
client.connect()
    .then(() => app.listen(PORT, () => console.log(`Server now listening on port ${PORT}`)))
    .catch(err => console.log('ERROR:', err));