'use strict';        


// DEPENDENCIES
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
require('dotenv').config();
const pg = require('pg');


// INITIALIZE APP - ESTABLISH PORT
const app = express();
const PORT = process.env.PORT || 3001;


// SQL SETTINGS
const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', err => console.error(err));


// USE CORS
app.use(cors());


// // SQL FUNCTION
// // NOTES 6/10 for LAB 8 DEMO
// app.get('/add', (request, response) => {
//   // collect information to add to our database
//   console.log('on the add route', request.query);
//   let first = request.query.first;
//   let last = request.query.last;

//   let sqlQuery = 'INSERT INTO people (first_name, last_name) VALUES ($1, $2);';
//   let safeValue = [first, last];

//   client.query(sqlQuery, safeValue)
//   .then(() => {})
//   .catch()
// })

// app.get('/select', (request, response) => {
//   // see everyone in the database to see them on the front end
//   let sqlQuery = 'SELECT * FROM people;';

//   client.query(sqlQuery)
//     .then(sqlResults => {
//       console.log(sqlResults.rows);
//       response.status(200).send(sqlResults.rows);
//     })
//     .catch()
// })


// API FUNCTIONS
app.get('/location', (request, response) => {
  try {
    const city = request.query.city;
    const url = `https://us1.locationiq.com/v1/search.php?key=${process.env.GEO_DATA_API_KEY}&q=${city}&format=json`;

    superagent.get(url).then(resultsFromSuperAgent => {
        let finalObj = new Location(city, resultsFromSuperAgent.body[0]);
        response.status(200).send(finalObj);
      })  
  } catch(err) {
    console.log('ERROR', err);
    response.status(500).send('sorry, we messed up');
  }
});

app.get('/weather', (request, response) => {
  try {
    const search_query = request.query.search_query;
    const key = process.env.WEATHER_API_KEY;
    const url = `https://api.weatherbit.io/v2.0/forecast/daily?city=${search_query}&key=${key}&days=8`;

    superagent.get(url).then(resultsFromSuperAgent => {
      const data = resultsFromSuperAgent.body.data;
      console.log(data);
      const results = data.map(item => new Weather(item));
      console.log(results);
      response.status(200).send(results);
    }) 
  } catch(err) {
    console.log('ERROR', err);
    response.status(500).send('sorry, we messed up');
  }    
});

app.get('/trails', (request, response) => {
  try { 
    const { latitude, longitude } = request.query;
    const key = process.env.TRAIL_API_KEY;
    const url = `https://www.hikingproject.com/data/get-trails?lat=${latitude}&lon=${longitude}&maxDistance=10&key=${key}`;
    console.log(request.query);

    superagent.get(url)
      .then(resultsFromSuperAgent => {
        const data = resultsFromSuperAgent.body.trails;
        const results = data.map(item => new Trail(item));
        console.log(results);
        response.status(200).send(results);
    }) 
  } catch(err) {
    console.log('ERROR', err);
    response.status(500).send('sorry, we messed up');
  }
});

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


// 404
app.get('*', (request, response) => {
  response.status(404).send('sorry, this route does not exist');
});


// CONNECT CLIENT
client.connect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`listening on ${PORT}`);
    })
})


// PORT LISTENER
app.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
});
