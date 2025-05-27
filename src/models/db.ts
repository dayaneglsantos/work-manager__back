import mysql from 'mysql2';
import dbConfig from '../config/db.config';

// connection.js
const connection = mysql.createConnection({
  host: dbConfig.HOST,
  port: Number(dbConfig.PORT),
  user: dbConfig.USER,
  password: dbConfig.PASSWORD,
  database: dbConfig.DB,
  ssl: {
    rejectUnauthorized: false,
  },
  connectTimeout: 30000,
});

export default connection;
