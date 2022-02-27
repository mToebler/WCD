const db = require('../db')//const { createCustomError } = require('../errors/custom-error')

const getUsageAll = async () => {
   const {rows} = await db.query('SELECT zone_id, SUM(usage) FROM zone_usage GROUP BY zone_id ORDER BY zone_id')
   console.log(rows)
   return JSON.stringify(rows);
}


module.exports = {  
   getUsageAll
}

// query for usage and duration from rachio
// select rachio.start_time, rachio.stop_time, rachio.zone_id, sum(flume.usage) as usage, age(rachio.stop_time, rachio.start_time) as duration  from rachio, flume where flume.time_id between rachio.start_time and rachio.stop_time group by rachio.zone_id, rachio.start_time, rachio.stop_time