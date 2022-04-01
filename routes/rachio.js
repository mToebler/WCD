const express = require('express')
// same as express router, but waits for promises? it's good and great for PG
const Router = require('express-promise-router')
const db = require('../db')
const router = Router()

const {
   getRachioEvents,
   getRachioDevice,
   getRachioZone,
   getRachioZones,
   startRachio,
   startRachioOneMinute
} = require('../controllers/rachio');

const queryRachio = async (req, res) => {
   // some params   
   let data =await getRachioEvents();   
   res.send(data);
};

const queryDevice = async (req, res) => {
   let data = await getRachioDevice();
   res.send(data);
}

const queryZone = async (req, res) => {
   const { id: zoneId } = req.params;
   let data = await getRachioZone(zoneId);
   res.send(data);
}

const queryZones = async (req, res) => {
   let data = await getRachioZones();
   res.json(data);
   // res.send(data);
}

const waterZone = async (req, res) => {
   const { id: zoneId, secs: seconds } = req.params;
   console.log('waterZone: id', zoneId, 'seconds', seconds)
   let isWatering = await startRachio(zoneId, parseInt(seconds));
   res.json(isWatering);
}

// const startRachioOneMinute = async (req, res) => {
//    const { id: zoneId } = req.params;
//    console.log('waterZone: id', zoneId, 'seconds', seconds)
//    let isWatering = await startRachio(zoneId, seconds);
//    return isWatering;
// }

router.route('/rachio').get(queryRachio);
router.route('/rachio/zone').get(queryZones);
router.route('/rachio/zone/:id').get(queryZone);
router.route('/rachio/device').get(queryDevice);
router.route('/rachio/startzone/:id/duration/:secs').get(waterZone);

module.exports = router;