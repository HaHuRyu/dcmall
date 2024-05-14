const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: '15.165.27.67',
    user: 'dcmall',
    password: 'dcmall45',
    database: 'dcmall',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

export default pool;