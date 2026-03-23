const mysql = require('mysql2/promise');
require('dotenv').config();

let pool;

if (process.env.MYSQL_URL) {
pool = mysql.createPool(
process.env.MYSQL_URL + "?ssl=%7B%22rejectUnauthorized%22%3Afalse%7D&multipleStatements=true"
);

} else {
pool = mysql.createPool({
host: process.env.DB_HOST,
port: process.env.DB_PORT,
database: process.env.DB_NAME,
user: process.env.DB_USER,
password: process.env.DB_PASSWORD,

waitForConnections: true,
connectionLimit: 10,

ssl: {
  rejectUnauthorized: false,
},

multipleStatements: true,

});
}

// Test connection
pool.getConnection()
.then(conn => {
console.log("✅ DB Connected");
conn.release();
})
.catch(err => {
console.error("❌ DB Error:", err.message);
});

module.exports = pool;