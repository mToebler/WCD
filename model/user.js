const db = require('../db')

class User {
  constructor(email, password) {
    this.email = email;
    this.password = password;
  }

  async findOne({ email }) {
    const { rows } = await db.query(`SELECT email, password FROM users WHERE email = $1`, [email]);
    console.log('DEBUG USER: rows: ', rows);
    // if (rows[0].email)
    return rows;
  }
};

module.exports = { User }; 