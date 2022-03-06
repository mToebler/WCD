const res = require('express/lib/response');
const db = require('../db'); //const { createCustomError } = require('../errors/custom-error');
const { getYearUsage } = require('./flume');   

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

module.exports = {  
   getUsageAll,
   getAverageUsageByZone,
   getAverageUsageForZone,
   getCurrentAverageUsageForZone,
   getMonthlyUsageForZone,
   getMonthlyUsage,
   injectTotalUsage
}

// query for usage and duration from rachio
// select rachio.start_time, rachio.stop_time, rachio.zone_id, sum(flume.usage) as usage, age(rachio.stop_time, rachio.start_time) as duration  from rachio, flume where flume.time_id between rachio.start_time and rachio.stop_time group by rachio.zone_id, rachio.start_time, rachio.stop_time