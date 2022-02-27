const express = require('express')
// same as express router, but waits for promises? it's good and great for PG
const Router = require('express-promise-router')
const db = require('../db')
const router = Router()

const {
   getRachioEvents,
   getRachioDevice
} = require('../controllers/rachio');

const queryRachio = async (req, res) => {
   // some params   
   let data =await getRachioEvents();   
   res.send(data);
};

router.route('/rachio').get(queryRachio);

module.exports = router;