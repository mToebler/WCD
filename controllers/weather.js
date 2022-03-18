const axios = require('axios')
const jwtDecode = require('jwt-decode')
// PG database
const db = require('../db')

const getWeatherInfoVegas = async () => {
   const _lasVegas = process.env.WEATHER_LOCATION_CODE;
   const url = `https://www.metaweather.com/api/location/${_lasVegas}/`;
   console.log('ping 2 - url: ', url);
   const weatherData = await axios.get(url);
   // console.log('ping 3', weatherData);
   // const data = await JSON.parse(weatherData);
   // console.log('ping 4: parsed:', data);
   return weatherData.data["consolidated_weather"];
}

const getWaterNews = async () => {
   let waterNewsData
   try {
      // from date needs to be within a 30 day range.
      const today = new Date();
      const from = new Date(today.getFullYear(), today.getMonth(), today.getDate())
      const ye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(from);
      const mo = new Intl.DateTimeFormat('en', { month: 'numeric' }).format(from);
      const da = new Intl.DateTimeFormat('en', { day: 'numeric' }).format(from);
      console.log(`${ye}-${mo}-${da}`);      
      const key = process.env.NEWS_API;   
      const url = `https://newsapi.org/v2/everything?q="water conservation"&from=${ye}-${mo}-${da}&sortBy=publishedAt&apiKey=${key}`;
      waterNewsData = await axios.get(url); 
   } catch(err) {
      console.error('Failed getWaterNews: ', err);
   }
   // console.log('waternews:', waterNewsData.data["articles"])
   return waterNewsData.data["articles"];
}

module.exports = {
   getWeatherInfoVegas,
   getWaterNews
};