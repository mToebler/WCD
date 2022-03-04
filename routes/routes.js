const express = require('express')
// same as express router, but waits for promises? it's good and great for PG
const Router = require('express-promise-router')
const db = require('../db')
const router = Router()
const { getUsageAll, getAverageUsageForZone, getAverageUsageByZone, getCurrentAverageUsageForZone, getMonthlyUsageForZone, getMonthlyUsage } = require('../controllers/controller')
const res = require('express/lib/response')
// const router = express.Router()

const getFlume = (req, res) => {
   console.log("get flume");
   res.json({
      status: "success",
      data: {
         startTime: "start datetime",
         stopTime: "stop datetime",
         usage: "number of 3.2",
      }
   })
}; 
   // = require('../controllers/controller')

   const getRachio = (req, res) => {
      console.log("get rachio");
      res.json({
         status: "success",
         data: {
            startTime: "start datetime",
            stopTime: "stop datetime",
            zone: "some zone int"
         }
      });
   };
   
const getZone = (req, res) => {
   const { id: zoneID } = req.params
   console.log("get zone", zoneID);
   res.json({
      status: "success",
      data: {
         startTime: Date.now() - (24 * 3600),
         stopTime: Date.now(),
         usage: Number(zoneID) * 3.6,
         zone: zoneID
      }
   });
 
};

const getUser = async (req, res) => {
   const { id: userID } = req.params
   console.log("get user", userID);
   const { rows } = await db.query('SELECT * FROM users WHERE users_id = $1', [userID])
   console.log(rows[0]);
   res.send(rows[0]);
 
};


const getUsage = async (req, res) => {
   let data = await getUsageAll();
   console.log(data);
   res.send(data);
}

const getGpmByZone = async (req, res) => {
   let data = await getAverageUsageByZone();
   res.send(data);
}

const getGpmForZone = async (req, res) => {
   const { id: zoneId } = req.params;
   let data = await getAverageUsageForZone(zoneId);
   res.send(data);
}

const getCurrentGpmForZone = async (req, res) => {
   const { id: zoneId } = req.params;
   let data = await getCurrentAverageUsageForZone(zoneId);
   res.send(data);
}

const getMonthlyForZone = async (req, res) => {
   const { id: zoneId } = req.params;
   let data = await getMonthlyUsageForZone(zoneId)
   res.send(data);
}

const getMonthlyForAll = async (req, res) => {   
   let data = await getMonthlyUsage();
   res.send(data);
}

// router.route('/flume').get(getFlume)
// router.route('/rachio').get(getRachio)
router.route('/zone/:id').get(getZone)
router.route('/user/:id').get(getUser)
router.route('/usage/all').get(getUsage)
router.route('/usage/gpm/:id').get(getGpmForZone)
router.route('/usage/gpm').get(getGpmByZone)
router.route('/usage/gpm/:id/current').get(getCurrentGpmForZone)
router.route('/usage/monthly/:id').get(getMonthlyForZone)
router.route('/usage/monthly').get(getMonthlyForAll)

module.exports = router;