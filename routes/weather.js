const express = require('express')
// same as express router, but waits for promises? it's good and great for PG
const Router = require('express-promise-router')
// const db = require('../db')
const router = Router()

const {
   getWaterNews,
   getWeatherInfoVegas
} = require('../controllers/weather');


const queryWeather = async (req, res) => {   
   const data = await getWeatherInfoVegas();   
   res.send(data);
}

const queryWaterNews = async (req, res) => {   
   const data = await getWaterNews();   
   res.send(data);
}

router.route('/weather').get(queryWeather);
router.route('/news').get(queryWaterNews);

module.exports = router;