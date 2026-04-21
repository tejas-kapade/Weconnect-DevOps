require("dotenv").config();
/* Old CODE, before adding retry logic for DB connection */
const mysql = require("mysql2");

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

module.exports = pool.promise();


/* New code, with retry logic for DB connection, Should be added
----Due to this error we are commenting this code
----ERROR: Failed to load resource: the server responded with a status of 500 (Internal Server Error)   (auth/login:1)

const mysql = require("mysql2/promise");

let connection;

async function connectDB() {
    while (true) {
        try {
            connection = await mysql.createConnection({
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME
            });

            console.log("DB Connected");
            break;

        } catch (err) {
            console.log("Waiting for DB...");
            await new Promise(res => setTimeout(res, 3000));
        }
    }
}

module.exports = { connectDB, getDB: () => connection };

*/