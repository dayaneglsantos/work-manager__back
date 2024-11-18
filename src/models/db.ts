import mysql from 'mysql2';
import dbConfig from '../config/db.config';

const connection = mysql.createConnection({
  host: dbConfig.HOST,
  user: dbConfig.USER,
  password: dbConfig.PASSWORD,
  database: dbConfig.DB,
});

export default connection;
