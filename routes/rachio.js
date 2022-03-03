const express = require('express')
// same as express router, but waits for promises? it's good and great for PG
const Router = require('express-promise-router')
const db = require('../db')
const router = Router()

const {
   getRachioEvents,
   getRachioDevice,
   getRachioZone,
   getRachioZones
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

router.route('/rachio').get(queryRachio);
router.route('/rachio/zone').get(queryZones);
router.route('/rachio/zone/:id').get(queryZone);
router.route('/rachio/device').get(queryDevice);

module.exports = router;