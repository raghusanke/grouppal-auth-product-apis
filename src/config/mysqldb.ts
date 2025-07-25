import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

export const mysqlDB = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

export const checkMySQLConnection = () => {
  mysqlDB.connect((err) => {
    if (err) {
      console.error('MySQL connection failed:', err.message);
      process.exit(1); 
    }
    console.log('MySQL Connected Successfully!');
  });
};
