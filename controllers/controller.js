const db = require('../db')//const { createCustomError } = require('../errors/custom-error')

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

module.exports = {  
   getUsageAll,
   getAverageUsageByZone,
   getAverageUsageForZone
}

// query for usage and duration from rachio
// select rachio.start_time, rachio.stop_time, rachio.zone_id, sum(flume.usage) as usage, age(rachio.stop_time, rachio.start_time) as duration  from rachio, flume where flume.time_id between rachio.start_time and rachio.stop_time group by rachio.zone_id, rachio.start_time, rachio.stop_time