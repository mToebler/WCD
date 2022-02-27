const express = require('express')
// same as express router, but waits for promises? it's good and great for PG
const Router = require('express-promise-router')
const db = require('../db')
const router = Router()
const {getUsageAll} = require('../controllers/controller')
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
   let data = await getUsageAll()
   console.log(data);
   res.send(data);
}


// router.route('/flume').get(getFlume)
// router.route('/rachio').get(getRachio)
router.route('/zone/:id').get(getZone)
router.route('/user/:id').get(getUser)
router.route('/usage/all').get(getUsage)
module.exports = router;