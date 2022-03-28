const express = require('express');
const Router = require('express-promise-router')
const morgan = require('morgan');
const verifyToken = require("./middleware/auth");
var cors = require('cors');
const app = express();
const routes = require('./routes/routes');
const flumeRoutes = require('./routes/flume');
const rachioRoutes = require('./routes/rachio');
const weatherRoutes = require('./routes/weather');
const userRoutes = require('./routes/user');

require('dotenv').config();

const router = new Router()
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

// auth
app.use('/api/v1', userRoutes);
// routes to use with routes middleware/module
app.use('/api/v1', verifyToken, flumeRoutes);
app.use('/api/v1', verifyToken, routes);
app.use('/api/v1', verifyToken, rachioRoutes);
app.use('/api/v1', verifyToken, weatherRoutes);

// app.use(notFound); 
// app.use(errorHandlerMiddleware);
const port = process.env.PORT || 3000;

const start = () => {
   app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
   );
};

start();

