const express = require('express')
// same as express router, but waits for promises? it's good and great for PG
const Router = require('express-promise-router')
const db = require('../db')
const router = Router()

const {
   getYearUsage,
   obtainToken,
   renewToken,
   getDevices,
   getDeviceInfo,
   getUsage,
   persistUsageData,
   getTotalWeekUsageForWeek,
   getTotalMonthsUsage
} = require('../controllers/flume');

const queryFlume = async (req, res) => {
   // some params
   await obtainToken();
   await getDevices();
   let data = await getUsage();
   await persistUsageData(); // load db
   res.send(data);
};

const queryFlumeYear = async (req, res) => {   
   let data = await getYearUsage();   
   res.send(data);
};

const queryUsageWeek = async (req, res) => {
   const { week: weekNum } = req.params;
   let data = await getTotalWeekUsageForWeek(weekNum);
   res.send(data);
}

const queryTotalMonthsUsage = async (req, res) => {   
   const { month: monthNum } = req.params;
   let data = await getTotalMonthsUsage(monthNum);   
   res.send(data)
}

router.route('/flume').get(queryFlume);
router.route('/flume/year').get(queryFlumeYear);
router.route('/flume/week/:week').get(queryUsageWeek);
router.route('/flume/month/:month').get(queryTotalMonthsUsage);

module.exports = router;