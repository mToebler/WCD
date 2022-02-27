
const axios = require('axios')
const jwtDecode = require('jwt-decode')
const _12HOURS = 43200000;
const _MINUTE = 60000;

// PG database
const db = require('../db')


/*
   Flume is a bit squirrelly. Need token, need userid, then deviceid. These must be 
   obtained in order. tokens=>userId=>deviceId
*/

var flumeTokens = {
   accessToken: '',
   refreshToken: '',
   expiresIn: '',
   userId: '',
   deviceId: ''
};

const now = Date.now();

const obtainToken = async () => {
   // Set up the payload
   const body = {
      grant_type: 'password',
      client_id: process.env.FLUME_CLIENT_ID,
      client_secret: process.env.FLUME_CLIENT_SECRET,
      username: process.env.FLUME_USERNAME,
      password: process.env.FLUME_PASSWORD
   };

   try {
      // Perform the HTTP request
      const flumeRes = await axios.post('https://api.flumetech.com/oauth/token', body, {
         timeout: 10000
      })

      // Check to see we got a response
      if(!flumeRes.data) {
         // throw new Error("No flume token received")
         console.log("Flume token NOT obtained =/")
      }

      // Capture tokens       
      flumeTokens.accessToken = flumeRes.data.data[0].access_token
      flumeTokens.refreshToken = flumeRes.data.data[0].refresh_token
      flumeTokens.expiresIn = now + flumeRes.data.data[0].expires_in
      // Decode user ID 
      flumeTokens.userId = jwtDecode(flumeTokens.accessToken).user_id
      console.log('Flume tokens obtained', flumeTokens);
      console.log('obtainToken %s.', JSON.stringify(flumeRes.data))
   } catch(err) {
      console.log("No Flume Token:", err)
   }
}

// Check flumeTokens.expiresIn < now() before firing
const renewToken = async () => {
   try {
      if(!flumeTokens.refreshToken)
         throw new Error("No token exists")

      const body = {
         grant_type: 'refresh_token',
         client_id: process.env.FLUME_CLIENT_ID,
         client_secret: process.env.FLUME_CLIENT_SECRET,
         refresh_token: flumeTokens.refreshToken
      }
      const now = Date.now()

      // Perform the HTTP request
      const res = await axios.post('https://api.flumetech.com/oauth/token', body, {
         timeout: 10000
      })

      // Check to see we got a response
      if(!res.data) {
         throw new Error("Refresh token failed")
      }

      // Log the response if in debug mode
      console.log('renewToken: %s.', JSON.stringify(res.data))

      // Capture new tokens
      flumeTokens.accessToken = res.data.data[0].access_token
      flumeTokens.refreshToken = res.data.data[0].refresh_token
      flumeTokens.expiresIn = now + res.data.data[0].expires_in

   } catch(err) {
      console.error("!! renewToken swallowed error:", err)
   }
};

// Returns info on both the Flume water sensor and its wifi-bridge 
const getDevices = async () => {
   try {
      // Check we have a user id
      if(!flumeTokens.userId || !flumeTokens.accessToken) {
         throw new Error("Need userId to retrieve devices")
      }

      // Perform the HTTP request
      const res = await axios.get('https://api.flumetech.com/users/' + flumeTokens.userId + '/devices', {
         headers: { Authorization: 'Bearer ' + flumeTokens.accessToken },
         timeout: 10000
      })

      // Check to see we got a response
      if(!res.data) {
         throw new Error("getDevices: No response")
      }

      console.log('getDevices %s.', JSON.stringify(res.data));
      // Save sensor device ID
      flumeTokens.deviceId = res.data.data[0].id
      // Parse response
      return res.data.data
   } catch(err) {
      throw new Error('getDevices: Error: %s', err)
   }
};
// Returns only info on ONE device. Flume sensor if nothing passed
const getDeviceInfo = async (deviceId) => {
   try {
      if(!deviceId)
         deviceId = flumeTokens.deviceId
      // Check access token
      if(Date.now() > flumeTokens.expiresIn) {
         await renewToken()
      }

      // Send the request
      const res = await axios.get(
         'https://api.flumetech.com/users/' + flumeTokens.userId + '/devices/' + deviceId,
         {
            headers: {
               Authorization: 'Bearer ' + flumeTokens.accessToken
            }
         }
      )

      // Check for response
      if(!res.data) {
         throw new Error('getDeviceInfo: Error: No response')
      }

      // Log the response if in debug mode   
      console.log('getDeviceInfo: %s.', JSON.stringify(res.data))

      // Parse the response
      return res.data.data[0]
   } catch(err) {
      console.error("getDeviceInfo: Swallowing error:", err, res.data.detailed[0])
   }
};


// getUsage - dev
// params: 
//    deviceId: device id of sensor
//    fromWhen: start of 12 hour retrival
const getUsage = async (deviceId, fromWhen) => {
   // fromWhen = 1642636250999;
   if(!fromWhen) fromWhen = Date.now() - (_12HOURS)
   // fromWhen = fromWhen + 60000; // one minute ahead
   console.log("fromWhen", fromWhen)
   if(!deviceId)
      deviceId = flumeTokens.deviceId
   // Check access token
   if(Date.now() > flumeTokens.expiresIn) {
      await renewToken()
   }

   // Capture dates for the query data
   const date = new Date()
   // const startOfToday = date.toISOString().substring(0, 10) + ' 12:00:00'
   // HARDCODED thursday (works in Jan 2022)
   date.setTime(fromWhen)
   const startDateMS = date.toISOString() // .substring(0, 10) + ' 00:00:00'
   if((date.getTime() + _12HOURS) > Date.now())
      date.setTime(Date.now())
   else
      date.setTime(date.getTime() + _12HOURS)
   const endDateMS = date.toISOString() // .substring(0, 10) + ' 12:00:00'
   console.log("Query dates", startDateMS, endDateMS)

   // Set the date to the first of the current month
   date.setDate(1)
   const startOfCurrMonth = date.toISOString().substring(0, 10) + ' 00:00:00'

   // Set the month to the previous month
   date.setMonth(date.getMonth() - 1)
   const startOfPrevMonth = date.toISOString().substring(0, 10) + ' 00:00:00'

   // Generate the JSON data to send
   const body = {
      queries: [
         {
            request_id: 'usage',
            bucket: 'MIN',
            since_datetime: startDateMS,
            until_datetime: endDateMS,
            units: 'GALLONS'
         }
      ]
   }

   // Send the request
   const res = await axios.post(
      'https://api.flumetech.com/users/' + flumeTokens.userId + '/devices/' + deviceId + '/query',
      body,
      {
         headers: {
            Authorization: 'Bearer ' + flumeTokens.accessToken
         }
      }
   )

   // Check to see we got a response
   if(!res.data) {
      throw new Error("getUsage: No response")
   }


   // console.log('getUsage %s.', JSON.stringify(res.data))


   // Parse response
   return res.data.data[0]
};


// The idea here is to find the latest date in the db, and poll Flume/getUsage
// until it's current. This is designed to be middleware. It requires a seed
// date to be in the database or it will fail.
/// TODO: now that it's inserting into the database, systematically load from 2 years ago.
const persistUsageData = async () => {
   if(Date.now() > flumeTokens.expiresIn) {
      await renewToken()
   }
   // query db
   //// debug   
   // const seedTime = 1642636250999 // 01-19-2022 23:50   
   // const seedTime = 1609459200000 // 01-01-2021 00:00:00 GMT
   // const seedTime = 1616276160000 // 03-20-2021 02:36:00 GMT // run tomorrow
   // const seedTime = 1611276120000 // 1-22-2021 12:42:00 GMT // run tomorrow
   // const seedTime = 1621398960000 // Wednesday, May 19, 2021 4:36:00 AM // run tomorrow
   // const seedTime = 1630180680000 // 8/28/2021 17:57 GMT
   
   //  to get latest seedTime from flume:
   // select extract(epoch from (select max(time_id) from flume)) * 1000
   const { rows } = await db.query('SELECT EXTRACT(EPOCH FROM (SELECT MAX(time_id) FROM flume)) * 1000 AS seedtime')
   const seedTime = rows[0].seedtime + 60000;

   console.log('DEBUG: seedTime rows', seedTime, rows);
   
   // loop through fetching segments in 12 hour increments
   for(x = seedTime; x < Date.now(); x = x + _12HOURS + _MINUTE) {
      console.log("get usage for :", x)
      const usage = await getUsage(flumeTokens.deviceId, x);
      // console.log("FROM ", x, usage.usage)
      await usage.usage.map((y) => {
         let date = Date.parse(y.datetime)
         let value = y.value
         console.log(date, value)
         // need to work on rows
         const { rows } = db.query(`INSERT INTO flume (time_id, usage) VALUES (TO_TIMESTAMP($1), $2)`, [date/1000, value]);
         console.log(rows)
      })
   }
}


// test
// obtainToken();
// setTimeout(getDevices, 2500)
// // setTimeout(getDeviceInfo.bind(process.env.FLUME_DEVICE_ID), 6000)
// setTimeout(getUsage, 4000)
// // setTimeout(renewToken, 10000)
// setTimeout(persistUsageData, 6000)


module.exports = {
   obtainToken,
   renewToken,
   getDevices,
   getDeviceInfo,
   getUsage,
   persistUsageData
};