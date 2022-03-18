const res = require('express/lib/response');
const merge = require('nodemon/lib/utils/merge');
const db = require('../db'); //const { createCustomError } = require('../errors/custom-error');
const { getYearUsage } = require('./flume');  
const { getRachioZones } = require('./rachio');  

const getUsageAll = async () => {
   const {rows} = await db.query('SELECT zone_id, SUM(usage) FROM zone_usage GROUP BY zone_id ORDER BY zone_id')
   console.log(rows)
   return JSON.stringify(rows);
}

const getAverageUsageByZone = async () => {
   const { rows } = await db.query('SELECT usage/(EXTRACT(EPOCH FROM duration)/60) AS gpm, usage, duration, zone_id FROM (SELECT SUM(duration) AS duration, SUM(usage) AS usage, zone_id FROM zone_usage GROUP BY zone_id) AS dual');
   console.log('getAverageUsageByZone', rows)
   return JSON.stringify(rows);
}

const getAverageUsageForZone = async (zoneId) => {   
   const { rows } = await db.query(`SELECT usage/(EXTRACT(EPOCH FROM duration)/60) AS gpm, usage, duration, zone_id FROM (SELECT SUM(duration) AS duration, SUM(usage) AS usage, zone_id FROM zone_usage WHERE zone_id = ${zoneId} GROUP BY zone_id) AS dual`);
   console.log('getAverageUsageForZone', rows)
   return JSON.stringify(rows);
}

const getCurrentAverageUsageForZone = async (zoneId) => {
   const { rows } = await db.query(`select start_time, zone_id,  usage, duration, usage/(extract(epoch from duration)/60) as gpm from zone_usage where zone_id = ${zoneId} and start_time in (select max(start_time) from zone_usage where zone_id = ${zoneId})`);
   
   console.log('getCurrentAverageUsageForZone', rows)

   return JSON.stringify(rows);
}

const getMonthlyUsageForZone = async (zoneId) => {
   const { rows } = await db.query(`SELECT TO_CHAR(date_trunc('month', start_time), 'Mon') as name, DATE_TRUNC('month', start_time) AS monthly, ROUND(SUM(usage)) as usage, zone_id FROM zone_usage WHERE start_time BETWEEN (NOW() - INTERVAL '1 year') AND NOW() AND zone_id = ${zoneId} GROUP BY name, monthly, zone_id ORDER BY monthly ASC`)
   console.log('getMonthUsageForZone:', rows)
   
   return JSON.stringify(rows);
}

const getMonthlyUsage = async () => {
   const { rows } = await db.query(`SELECT TO_CHAR(date_trunc('month', start_time), 'Mon') as name, DATE_TRUNC('month', start_time) AS monthly, ROUND(SUM(usage)) as usage FROM zone_usage WHERE start_time BETWEEN (NOW() - INTERVAL '1 year') AND NOW() GROUP BY name, monthly ORDER BY monthly ASC`)
   console.log('getMonthUsage:', rows)
   
   return JSON.stringify(rows);
}

const injectTotalUsage = async () => {
   const totalUsage = await getYearUsage();
   const usageData = await getMonthlyUsage();
   let mergedData = JSON.parse(usageData);
   
   for(i = 0; i < mergedData.length; i++) {      
      console.log("i debug", i, mergedData.length);
      mergedData[i]["totalUsage"] = totalUsage[i]["usage"];      
      console.log("injectDebug: during:", i, mergedData[i]);
   }
   
   return JSON.stringify(mergedData);
}

const injectLatestActivity = async (num) => {   
   const sortedZones = await getRachioZones();
   console.log("sortedZones:", sortedZones);   
   const latestZoneActivity = sortedZones.map((activity, ndx) => {
      const zoneNum = activity["zoneNumber"];
      const name = activity["name"];
      const img = activity["imageUrl"];
      return { zoneNum, name, img };
   })

   const latestZA = [...latestZoneActivity];
   // Now get the start time, usage, and duration
   const { rows } = await db.query(`select zone_id, start_time, usage, duration from zone_usage order by start_time desc limit ${num}`);

   const mergedZA = combineLatestArrays(rows, latestZA);
   
   return mergedZA;
}  

const combineLatestArrays = (activityArr, referenceArr) => {
   console.log('activity: ',  activityArr, '\nrefenceArr: ', referenceArr)
   let combinedArr = activityArr.map((el) => {
      const id = el["zone_id"]
      const name = referenceArr[id-1]["name"]
      const img = referenceArr[id - 1]["img"]
      const mElement = { ...el, name, img };
      console.log('mElement:', mElement);
      return mElement;
   })

   return combinedArr;

}

module.exports = {  
   getUsageAll,
   getAverageUsageByZone,
   getAverageUsageForZone,
   getCurrentAverageUsageForZone,
   getMonthlyUsageForZone,
   getMonthlyUsage,
   injectTotalUsage,
   injectLatestActivity
}

// query for usage and duration from rachio
// select rachio.start_time, rachio.stop_time, rachio.zone_id, sum(flume.usage) as usage, age(rachio.stop_time, rachio.start_time) as duration  from rachio, flume where flume.time_id between rachio.start_time and rachio.stop_time group by rachio.zone_id, rachio.start_time, rachio.stop_time