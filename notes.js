'use strict';

// create your server 'mkdir server'
// Initialize your package.json witn 'npm init
// Create our dependencies with 'npm init -S express cors dotenv superagent'            

// express library sets up our server
const express = require('express');
// bodyguard of our server - tells who is ok to send data to
const cors = require('cors');
// superagent goes out into the internet and gets information from APIs
const superagent = require('superagent');
// dotenv lets us get our secrets from our .env file
require('dotenv').config();

// initalizes our express library into our variable called app
const app = express();
// bring in the PORT by using process.env.variable name
const PORT = process.env.PORT || 3001;
app.use(cors());

app.get('/location', (request, response) => {
  try{
    let search_query = request.query.city;

    let url = `https://us1.locationiq.com/v1/search.php?key=${process.env.GEO_DATA_API_KEY}&q=${search_query}&format=json`;
  
    // let geoData = require('./data/location.json');

    superagent.get(url)
      .then(resultsFromSuperAgent => {
        let finalObj = new Location(search_query, resultsFromSuperAgent.body[0]);
        response.status(200).send(finalObj);
      })
  
    
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


app.get('/weather', (request, response) => {
  try{
    const search_query = request.query.search_query;
    const key = process.env.WEATHER_API_KEY;
    const url = `https://api.weatherbit.io/v2.0/current?city=${search_query}&key=${key}`;

    superagent.get(url).then(resultsFromSuperAgent => {
      const data = resultsFromSuperAgent.body.data;
      const results = [];
      data.map(item => results.push(new Weather(obj.valid_date, obj.weather.description)));
      response.status(200).send(results);
    }) 
  } catch(err) {
    console.log('ERROR', err);
    response.status(500).send('sorry, we messed up');
  }    
})
  
  function Weather(obj){
    this.forecast = obj.weather.description;
    this.time = obj.valid_date;
  }

  app.get('*', (request, response) => {
    response.status(404).send('sorry, this route does not exist');
  })





  // turn on the lights - move into the house - start the server
  app.listen(PORT, () => {
    console.log(`listening on ${PORT}`);
  })

  // three ways to check if our server is on: npm start, node server.js, nodemon (the best because it continually checks if you make updates)
  // when you're done with your server make sure to use ^C to shut it off, rather than just closing your terminal, otherwise it'll continue to listen for changes. Kill all node servers: 'pkill node'
