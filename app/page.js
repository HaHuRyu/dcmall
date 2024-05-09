const mysql = require('mysql');


const connection = mysql.createConnection({
  host: '15.165.27.67',
  user: 'dcmall',
  password: 'dcmall45',
  database: 'dcmall'
});

console.log("DB_HOST: "+ process.env.DB_HOST)


connection.connect(function(err) {
  if (err) {
    console.error('Error connecting to MySQL database: ' + err.stack);
    return;
  }
  console.log('Connected to MySQL database as id ' + connection.threadId);
});

export default function Home() {
  return (
    <div>
      <h4>dcmall</h4>

      <form action="/api/post/login" method = "POST">
        <input type="text" placeholder="ID" name="id" />
        <input type="password" placeholder="PW" name="password" />
        <button type="submit">login</button>
      </form>

      <a href="/join"><button>회원가입</button></a>
    </div>
  );
}
