const express = require('express');
const morgan = require('morgan');
var cors = require('cors');
const db = require('./db');
const app = express();
const routes = require('./routes/routes');
const flumeRoutes = require('./routes/flume');
const rachioRoutes = require('./routes/rachio');
const weatherRoutes = require('./routes/weather');
// temp inplace for rachioRoutes
const rachio = require('./controllers/rachio');
const connectDB = require('./db/index');
require('dotenv').config();

// 'use strict' // flume?

// const axios = require('axios')
// const jwtDecode = require('jwt-decode')
// const { flumeSDK }  = require('./routes/flume');
// const notFound = require('./middleware/not-found');
// const errorHandlerMiddleware = require('./middleware/error-handler');

// test and experiment

// middleware
app.use(morgan("dev"))
app.use(cors());
app.use(express.static('./public'));
// gives access to the req.body as a standard JS obj.
app.use(express.json());
app.use(((req, res, next) => {
   console.log('middleware');
   next();

}))

// TODO: middleware to update rachio and flume's database entries if needed.
// Check the db tables to see what the latest date is. For flume, remote API 
// fetch will be needed if more than 1 minute. Rachio is negotiable at this 
// point. Load latest into the db and continue. 

// TODO: need initial db load routines. these will be run once.
/* make the request to flume using the controller, grab the data, map it 
   to insert into the database. easy peasy.
   controll the above with a routine that finds the last moment and divides it 
   into segments of 12 hours: request 12 hours, insert 12 hours. wash repeat.*/

// routes to use with routes middleware/module
app.use('/api/v1', routes);
app.use('/api/v1', flumeRoutes);
app.use('/api/v1', rachioRoutes);
app.use('/api/v1', weatherRoutes);

// app.use(notFound);
// app.use(errorHandlerMiddleware);
const port = process.env.PORT || 3000;

const start = () => {
   app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
   );
};

start();


// var flumeTokens = {
//    accessToken: '',
//    refreshToken: '',
//    expiresIn: '',
//    userId: '',
//    deviceId: ''
// };

// const now = Date.now();

// const obtainToken = async () => {
//    // Set up the payload
//    const body = {
//       grant_type: 'password',
//       client_id: process.env.FLUME_CLIENT_ID,
//       client_secret: process.env.FLUME_CLIENT_SECRET,
//       username: process.env.FLUME_USERNAME,
//       password: process.env.FLUME_PASSWORD
//    };

//    try {
//       // Perform the HTTP request
//       const flumeRes = await axios.post('https://api.flumetech.com/oauth/token', body, {
//          timeout: 10000
//       })

//       // Check to see we got a response
//       if(!flumeRes.data) {
//          // throw new Error("No flume token received")
//          console.log("Flume token NOT obtained =/")
//       }

//       // Capture tokens       
//       flumeTokens.accessToken = flumeRes.data.data[0].access_token
//       flumeTokens.refreshToken = flumeRes.data.data[0].refresh_token
//       flumeTokens.expiresIn = now + flumeRes.data.data[0].expires_in
//       // Decode user ID 
//       flumeTokens.userId = jwtDecode(flumeTokens.accessToken).user_id
//       console.log('Flume tokens obtained', flumeTokens);
//       console.log('obtainToken %s.', JSON.stringify(flumeRes.data))
//    } catch(err) {
//       console.log("No Flume Token:", err)
//    }
// }

// // Check flumeTokens.expiresIn < now() before firing
// const renewToken = async () => {
//    try {
//       if(!flumeTokens.refreshToken)
//          throw new Error("No token exists")

//       const body = {
//          grant_type: 'refresh_token',
//          client_id: process.env.FLUME_CLIENT_ID,
//          client_secret: process.env.FLUME_CLIENT_SECRET,
//          refresh_token: flumeTokens.refreshToken
//       }
//       const now = Date.now()

//       // Perform the HTTP request
//       const res = await axios.post('https://api.flumetech.com/oauth/token', body, {
//          timeout: 10000
//       })

//       // Check to see we got a response
//       if(!res.data) {
//          throw new Error("Refresh token failed")
//       }

//       // Log the response if in debug mode
//       console.log('renewToken: %s.', JSON.stringify(res.data))

//       // Capture new tokens
//       flumeTokens.accessToken = res.data.data[0].access_token
//       flumeTokens.refreshToken = res.data.data[0].refresh_token
//       flumeTokens.expiresIn = now + res.data.data[0].expires_in

//    } catch(err) {
//       console.error("!! renewToken swallowed error:", err)
//    }
// }

// // Returns both the Flume water sensor and its wifi-bridge info
// const getDevices = async () => {
//    try {
//       // Check we have a user id
//       if(!flumeTokens.userId || !flumeTokens.accessToken) {
//          throw new Error("Need userId to retrieve devices")
//       }

//       // Perform the HTTP request
//       const res = await axios.get('https://api.flumetech.com/users/' + flumeTokens.userId + '/devices', {
//          headers: { Authorization: 'Bearer ' + flumeTokens.accessToken },
//          timeout: 10000
//       })

//       // Check to see we got a response
//       if(!res.data) {
//          throw new Error("getDevices: No response")
//       }

//       console.log('getDevices %s.', JSON.stringify(res.data));
//       // Save sensor device ID
//       flumeTokens.deviceId = res.data.data[0].id
//       // Parse response
//       return res.data.data
//    } catch(err) {
//       throw new Error('getDevices: Error: %s', err)
//    }
// }
// // Returns only info on ONE device. Flume sensor if nothing passed
// const getDeviceInfo = async (deviceId) => {
//    try {
//       if(!deviceId)
//          deviceId = flumeTokens.deviceId
//       // Check access token
//       if(Date.now() > flumeTokens.expiresIn) {
//          await renewToken()
//       }

//       // Send the request
//       const res = await axios.get(
//          'https://api.flumetech.com/users/' + flumeTokens.userId + '/devices/' + deviceId,
//          {
//             headers: {
//                Authorization: 'Bearer ' + flumeTokens.accessToken
//             }
//          }
//       )

//       // Check for response
//       if(!res.data) {
//          throw new Error('getDeviceInfo: Error: No response')
//       }

//       // Log the response if in debug mode   
//       console.log('getDeviceInfo: %s.', JSON.stringify(res.data))

//       // Parse the response
//       return res.data.data[0]
//    } catch(err) {
//       console.error("getDeviceInfo: Swallowing error:", err, res.data.detailed[0])
//    }
// }


// // getUsage - dev
// // params: 
// //    deviceId: device id of sensor
// //    fromWhen: start of 12 hour retrival
// const getUsage = async (deviceId) => {
//    if(!deviceId)
//       deviceId = flumeTokens.deviceId
//    // Check access token
//    if(Date.now() > flumeTokens.expiresIn) {
//       await renewToken()
//    }

//    // Capture dates for the query data
//    const date = new Date()
//    const startOfToday = date.toISOString().substring(0, 10) + ' 12:00:00'

//    // HARDCODED thursday (works in Jan 2022)
//    date.setDate(22)
//    const prevThursday =  date.toISOString().substring(0, 10) + ' 09:40:00'
//    const prevThursdayEnd =  date.toISOString().substring(0, 10) + ' 12:40:00'
   
//    // Set the date to the first of the current month
//    date.setDate(1)
//    const startOfCurrMonth = date.toISOString().substring(0, 10) + ' 00:00:00'

//    // Set the month to the previous month
//    date.setMonth(date.getMonth() - 1)
//    const startOfPrevMonth = date.toISOString().substring(0, 10) + ' 00:00:00'

//    // Generate the JSON data to send
//    const body = {
//       queries: [
//          {
//             request_id: 'today',
//             bucket: 'MIN',
//             since_datetime: startOfToday,            
//             units: 'GALLONS'
//          },
//          {
//             request_id: 'thursday',
//             bucket: 'MIN',
//             since_datetime: prevThursday,
//             until_datetime: prevThursdayEnd,
//             units: 'GALLONS'
//          },
//          {
//             request_id: 'month',
//             bucket: 'MON',
//             since_datetime: startOfCurrMonth,
//             operation: 'SUM',
//             units: 'GALLONS'
//          },
//          {
//             request_id: 'prevMonth',
//             bucket: 'MON',
//             since_datetime: startOfPrevMonth,
//             until_datetime: startOfCurrMonth,
//             operation: 'SUM',
//             units: 'GALLONS'
//          }
//       ]
//    }

//    // Send the request
//    const res = await axios.post(
//       'https://api.flumetech.com/users/' + flumeTokens.userId + '/devices/' + deviceId + '/query',
//       body,
//       {
//          headers: {
//             Authorization: 'Bearer ' + flumeTokens.accessToken
//          }
//       }
//    )

//    // Check to see we got a response
//    if(!res.data) {
//       throw new Error("getUsage: No response")
//    }


//    console.log('getUsage %s.', JSON.stringify(res.data))


//    // Parse response
//    return res.data.data[0]
// }

// // test
// obtainToken();
// setTimeout(getDevices, 2500)
// // setTimeout(getDeviceInfo.bind(process.env.FLUME_DEVICE_ID), 6000)
// setTimeout(getUsage, 4000)
// setTimeout(renewToken, 10000)


