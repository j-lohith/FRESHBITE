const mysql = require('mysql2/promise');
require('dotenv').config();

// 🔥 If MYSQL_URL exists → use it (BEST for Railway)
let pool;

if (process.env.MYSQL_URL) {
pool = mysql.createPool({
uri: process.env.MYSQL_URL,


waitForConnections: true,
connectionLimit: 10,

// 🔥 REQUIRED for Railway
ssl: {
  rejectUnauthorized: false,
},

multipleStatements: true,


});
} else {
// 🔁 Fallback (manual config)
pool = mysql.createPool({
host: process.env.DB_HOST || 'localhost',
port: process.env.DB_PORT || 3306,
database: process.env.DB_NAME || 'restaurant_db',
user: process.env.DB_USER || 'root',
password: process.env.DB_PASSWORD || '',


waitForConnections: true,
connectionLimit: 10,
queueLimit: 0,

// 🔥 IMPORTANT
ssl: {
  rejectUnauthorized: false,
},

multipleStatements: true,


});
}

// 🔍 Test connection
pool.getConnection()
.then(connection => {
console.log('✅ Connected to MySQL database');
connection.release();
})
.catch(err => {
console.error('❌ MySQL Connection Error:', err.message);
});

module.exports = pool;
