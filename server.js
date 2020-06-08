'use strict';

// express library sets up our server
const express = require('express');
// initalizes our express library into our variable called app
const app = express();

// dotenv lets us get our secrets from our .env file
require('dotenv').config();

// bodyguard of our server - tells who is ok to send data to
const cors = require('cors');
app.use(cors());


// bring in the PORT by using process.env.variable name
const PORT = process.env.PORT || 3001;

app.get('/location', (request, response) => {
  try{
    // query: { city: 'seattle' },
    console.log(request.query.city);
    let search_query = request.query.city;
  
    let geoData = require('./data/location.json');
  
    let returnObj = new Location(search_query, geoData[0]);
  
    console.log(returnObj);
    // let returnObj = {
    //   search_query: search_query,
    //   formatted_query: geoData[0].display_name,
    //   latitude: geoData[0].lat,
    //   longitude: geoData[0].lon
    // }
  
    response.status(200).send(returnObj);
    
  } catch(err){
    console.log('ERROR', err);
    response.status(500).send('sorry, we messed up');
  }

})

function Location(searchQuery, obj){
  this.search_query = searchQuery;
  this.formatted_query = obj.display_name;
  this.latitude = obj.lat;
  this.longitude = obj.lon;
}

app.get('*', (request, response) => {
  response.status(404).send('sorry, this route does not exist');
})

app.get('/weather', (request, response) => {
  try{
    // data: { "valid_date": "2020-04-13" },
    console.log(request.data.valid_date);
    let valid_date = request.data.valid_date;
  
    let weatherData = require('./data/weather.json');
  
    let returnObj = new Weather(city_name, weatherData[0]);
  
    console.log(returnObj);
    // let returnObj = {
    //   search_query: search_query,
    //   formatted_query: geoData[0].display_name,
    //   latitude: geoData[0].lat,
    //   longitude: geoData[0].lon
    // }
  
    response.status(200).send(returnObj);
    
  } catch(err){
    console.log('ERROR', err);
    response.status(500).send('sorry, we messed up');
  }

})

function Weather(searchQuery, obj){
  // we want data.weather.description, data.valid_date
  this.city_name = searchQuery;
  // this.formatted_query = obj.display_name;
  this.data.weather.description = obj.description;
  this.data.valid_date = obj.date;
}

app.get('*', (request, response) => {
  response.status(404).send('sorry, this route does not exist');
})

// turn on the lights - move into the house - start the server
app.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
})