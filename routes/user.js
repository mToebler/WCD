const Router = require('express-promise-router')
const db = require('../db')
const User = require('../model/user')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

// create a new express-promise-router
// this has the same API as the normal express router except
// it allows you to use async functions as route handlers
const router = new Router()

// export our router to be mounted by the parent application

// router.get('/:id', async (req, res) => {
//   const { id } = req.params
//   const { rows } = await db.query('SELECT * FROM users WHERE id = $1', [id])
//   res.send(rows[0])
// })

const login = async (req, res) => {
  try {
    // Get user input
    const { email, password } = req.body;    
    // Validate user input
    if (!(email && password)) {
      res.status(400).send("All input is required");
    }
    // Validate if user exist in our database
    const { rows } = await db.query('SELECT users_id, email, pw as password FROM users WHERE email = $1', [email]);
    // Cheap way to create an object
    let user = rows[0];
    console.log('bcrypt pw', bcrypt.hashSync(user.password, 10));
    if (user && (await bcrypt.compare(password, user.password))) {
      // Create token
      const token = jwt.sign(
        { user_id: user.users_id, email },
        process.env.TOKEN_KEY,
        {
          expiresIn: "2h",
        }
      );

      // save user token
      user.token = token;
      // remove password before transmitting
      delete user.password;
      // user
      res.status(200).json(user);
    }
    res.status(400).send("Invalid Credentials");
  } catch (err) {
    console.log(err);
  }
}

router.route('/login').put(login);

module.exports = router;