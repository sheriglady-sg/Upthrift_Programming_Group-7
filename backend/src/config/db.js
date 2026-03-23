const mysql = require('mysql2/promise');// import mysql2/promise for async/await support
require('dotenv').config();// read content of .env file

const pool = mysql.createPool({// create a connection pool to database, reuseable connections for better performance
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

module.exports = pool;// export, other application files can use
