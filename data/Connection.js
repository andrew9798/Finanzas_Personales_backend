// database/connection.js
import mysql from 'mysql2/promise';

const connection = mysql.createPool({
  host: '127.0.0.1',
  port:"3306",
  user: 'root',
  password: '',
  database: 'finanzas_personales'
});

export default connection;