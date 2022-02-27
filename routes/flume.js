const express = require('express')
// same as express router, but waits for promises? it's good and great for PG
const Router = require('express-promise-router')
const db = require('../db')
const router = Router()

const {
   obtainToken,
   renewToken,
   getDevices,
   getDeviceInfo,
   getUsage,
   persistUsageData
} = require('../controllers/flume');

const queryFlume = async (req, res) => {
   // some params
   await obtainToken();
   await getDevices();
   let data = await getUsage();
   await persistUsageData(); // load db
   res.send(data);
};

router.route('/flume').get(queryFlume);

module.exports = router;