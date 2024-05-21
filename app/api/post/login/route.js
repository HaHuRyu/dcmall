// app/api/post/login/route.js
import { NextResponse } from "next/server";
import { password_salt } from "../../../_lib/salt";
import { getConnection } from "../../../_lib/db";
import CryptoJS from 'crypto-js';


export async function POST(req) {
  try {
    const text = await req.text();
    const params = new URLSearchParams(text);
    const id = params.get("id");
    let password = params.get("password");
    
    //password = hash(password);

    console.log(id)

    const connection = await getConnection();
    const query = "SELECT * FROM user WHERE id = ?";
    const rows = connection.query(query, [id]);

    // 결과 처리
    console.log("rows : " + rows);

    if (rows.length > 0) {
      return res.status(200).json({ message: 'Login successful', data: rows });
    } else {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error("Request parsing error:", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

function hash(password) {

  var salt = password.slice(-6)
  var userPw = password.slice(0, [-6])


  return password_salt(userPw, salt)

}
