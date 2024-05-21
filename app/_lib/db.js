// lib/db.js
import mysql from 'mysql2';

let connection;

export function getConnection() {
  if (!connection) {
    connection = mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
    });
    console.log(process.env.DB_HOST)
    connection.connect(function (err) {
      if (err) {
        console.error('MySQL 데이터베이스 연결 중 오류 발생:', err.stack);
        console.error('환경 변수 확인:', {
          DB_HOST: process.env.DB_HOST,
          DB_USER: process.env.DB_USER,
          DB_PASSWORD: process.env.DB_PASSWORD,
          DB_DATABASE: process.env.DB_DATABASE,
        });
        return;
      }
      console.log('MySQL 데이터베이스에 연결되었습니다. 연결 ID:', connection.threadId);
    });
  }
  return connection;
}
