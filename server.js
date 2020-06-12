'use strict';        


// DEPENDENCIES
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
require('dotenv').config();
const pg = require('pg');
const { query } = require('express');


// INITIALIZE APP - ESTABLISH PORT
const app = express();
const PORT = process.env.PORT || 3001;


// SQL SETTINGS
const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', err => console.error(err));


// USE CORS
app.use(cors());


// SQL FUNCTION
app.get('/add', (request, response) => {
  // collect information to add to our database
  console.log('on the add route', request.query);
  let city = request.query.city;

  let sqlQuery = 'INSERT INTO locations (search_query, formatted_query, latitude, longitude) VALUES ($1, $2, $3, $4);';
  let safeValue = [city];

  client.query(sqlQuery, safeValue)
  .then(() => {})
  .catch()
});


// CALLING HANDLERS
app.get('/location', locationHandler);
app.get('/weather', weatherHandler);
app.get('/trails', trailsHandler);
app.get('/yelp', restaurantHandler);
app.get('/movies', moviesHandler);
app.use('*', handleNotFound);


// API FUNCTIONS
function locationHandler(request, response) {
  
  const city = request.query.city;
  // console.log(city);
  const url = `https://us1.locationiq.com/v1/search.php`;
  
  const queryParams = {
    key: process.env.GEO_DATA_API_KEY,
    q: city,
    format: 'json',
    limit: 1
  }
  
  let sqlQuery = 'SELECT * FROM locations WHERE search_query LIKE ($1);';
  let safeValue = [city];
  
  client.query(sqlQuery, safeValue) 
  .then(sqlResults => {
    // console.log(sqlQuery, safeValue);
    // console.log(sqlResults);
    if (sqlResults.rowCount !== 0){
      // console.log(sqlResults.rows);
      response.status(200).send(sqlResults.rows[0]);
    } else {
      // Check superagent documentation to find out how to set a header
      superagent.get(url).query(queryParams).then(resultsFromSuperAgent => {
        // console.log('results from superagent', resultsFromSuperAgent.body);
        const geoData = resultsFromSuperAgent.body[0];
        let finalObj = new Location(city, geoData);
        let sqlQuery = 'INSERT INTO locations (search_query, formatted_query, latitude, longitude) VALUES ($1, $2, $3, $4);';
        let safeValue = [city, finalObj.formatted_query, finalObj.latitude, finalObj.longitude];
        
        client.query(sqlQuery, safeValue);
        response.status(200).send(finalObj);
      }).catch();
    }
  }).catch(err => console.error(err));
};

function weatherHandler(request, response) {
  try {
    const search_query = request.query.search_query;
    const key = process.env.WEATHER_API_KEY;
    const url = `https://api.weatherbit.io/v2.0/forecast/daily?city=${search_query}&key=${key}&days=8`;
    
    superagent.get(url).then(resultsFromSuperAgent => {
      const data = resultsFromSuperAgent.body.data;
      const results = data.map(item => new Weather(item));
      response.status(200).send(results);
    }) .catch();
  } catch(err) {
    console.log('ERROR', err);
    response.status(500).send('sorry, we messed up');
  }    
};
      
function trailsHandler(request, response) {
  try { 
    const { latitude, longitude } = request.query;
    const key = process.env.TRAIL_API_KEY;
    const url = `https://www.hikingproject.com/data/get-trails?lat=${latitude}&lon=${longitude}&maxDistance=10&key=${key}`;
    
    superagent.get(url)
    .then(resultsFromSuperAgent => {
      const data = resultsFromSuperAgent.body.trails;
      const results = data.map(item => new Trail(item));
      response.status(200).send(results);
    }) .catch();
  } catch(err) {
    console.log('ERROR', err);
    response.status(500).send('sorry, we messed up');
  }
};
      
      
function restaurantHandler(request, response) {
  console.log('this is our restaurant', request.query);

  const page = request.query.page;
  console.log('page', page);
  const numPerPage = 5;
  const start = (page - 1) * numPerPage; // this allows us to start with the 1-5 and then 5-10 and then 10-15 etc.

  const url =  `https://api.yelp.com/v3/businesses/search?latitude=${request.query.latitude}&longitude=${request.query.longitude}`;

  const queryParams = {
    start: start,
    limit: numPerPage
  }

  superagent.get(url)
    .set('Authorization', `Bearer ${process.env.YELP_API_KEY}`)
    .query(queryParams)
    .then(data => {
      let restaurantArray = data.body.businesses;

      const finalRestaurants = restaurantArray.map(eatery => {
        return new Restaurant(eatery);
      })
      // page += 1;
      response.status(200).send(finalRestaurants);
    })
    .catch();
};

function moviesHandler(request, response) {
  console.log('this is our movies', request.query);
  try { 
    const city = request.query.search_query;
    const key = process.env.MOVIE_API_KEY;
    const url = `https://api.themoviedb.org/3/search/movie?api_key=${key}&query=${city}`;
    
    superagent.get(url)
    .then(resultsFromSuperAgent => {
      const data = resultsFromSuperAgent.body.results;
      const results = data.map(item => new Movies(item));
      // console.log('data', data);
      response.status(200).send(results);
    }) 
    .catch();
  } catch(err) {
    console.log('ERROR', err);
    response.status(500).send('sorry, we messed up');
  };
}


// CONSTRUCTORS
function Location(searchQuery, obj){
  this.search_query = searchQuery;
  this.formatted_query = obj.display_name;
  this.latitude = obj.lat;
  this.longitude = obj.lon;
};
      
function Weather(obj){
  this.forecast = obj.weather.description;
  this.time = obj.datetime;
};

function Trail(obj){
  this.name = obj.name;
  this.location = obj.location;
  this.length = obj.length;
  this.stars = obj.stars;
  this.star_votes = obj.starVotes;
  this.summary = obj.summary;
  this.trail_url = obj.url;
  this.conditions = obj.conditionDetails;
  this.condition_date = obj.conditionDate.slice(0, 10);
  this.condition_time = obj.conditionDate.slice(11);
};
      
function Restaurant(obj){
  this.name = obj.name;
  this.image_url = obj.url;
  this.price = obj.price;
  this.rating = obj.rating;
  this.url = obj.url;
};

function Movies(obj){
  this.title = obj.title;
  this.overview = obj.overview;
  this.average_votes = obj.vote_average;
  this.total_votes = obj.vote_count;
  this.image_url = `https://image.tmdb.org/t/p/w500${obj.poster_path}`;
  this.popularity = obj.popularity;
  this.released_on = obj.release_date;
};
      
      
// 404
function handleNotFound(request, response) {
  response.status(404).send('sorry, this route does not exist');
};


// CONNECT CLIENT
client.connect().then(() => {
  app.listen(PORT, () => {
    console.log(`listening on ${PORT}`);
  })
})
