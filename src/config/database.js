//Database configuration
const mysql2 = require('mysql2');

const pool = mysql2.createPool({
    host: process.env.MYSQL_DB_HOST,
    user: process.env.MYSQL_DB_USER,
    password: process.env.MYSQL_DB_PASS,
    database: process.env.MYSQL_DB_NAME,
    connectionLimit: process.env.MYSQL_CONNECTION_LIMIT||0,
    queueLimit: process.env.MYSQL_QUEUE_LIMIT||0,
    connectTimeout: process.env.MYSQL_CONNECT_TIMEOUT||10000,
    multipleStatements: process.env.MYSQL_MULTIPLE_STATEMENTS||true
}).promise();

module.exports = pool;
