// lib/db.js
/*
왜 mysql2/promise를 사용해야 하는가?
프로미스 기반 API: 비동기 작업을 더 쉽게 관리하고, async/await 구문을 사용하여 비동기 코드의 가독성을 높일 수 있습니다.
콜백 기반 API: 더 복잡한 콜백 헬(callback hell)을 피하기 어려울 수 있습니다.
*/
import mysql from 'mysql2/promise';

let connection;

export async function getConnection() {
  try{
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
    });
    console.log('MySQL 데이터베이스에 연결되었습니다. 연결 ID:', connection.threadId);
    return connection;
  } catch(error){
    console.error('MySQL 연결 오류:', error);
    throw error;
  }
 
}

export async function queryDatabase(id) {
  const connection = await getConnection();
  const query = "SELECT * FROM user WHERE id = ?";

  try {
      const [rows, fields] = await connection.query(query, [id]);
      console.log("Rows:", rows);
      console.log("Fields:", fields);
      return rows;
  } catch (error) {
      console.error("Error executing query:", error);
      throw error;
  } finally {
      if (connection) {
          await connection.end(); // 연결 닫기
      }
  }
}
