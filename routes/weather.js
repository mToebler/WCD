const express = require('express')
// same as express router, but waits for promises? it's good and great for PG
const Router = require('express-promise-router')
// const db = require('../db')
const router = Router()

const {
   getWeatherInfoVegas
} = require('../controllers/weather');


const queryWeather = async (req, res) => {   
   const data = await getWeatherInfoVegas();   
   res.send(data);
}

router.route('/weather').get(queryWeather);

module.exports = router;