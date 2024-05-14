// app/api/post/login/route.js
import { NextResponse } from "next/server";
import { getConnection } from "../../../_lib/db";
import CryptoJS from 'crypto-js';


export async function POST(req) {
  try {
    const text = await req.text();
    const params = new URLSearchParams(text);
    const id = params.get("id");
    let password = params.get("password");
    
    console.log('dada'+text)

    console.log('params'+params)

    password = hash(password);

    const connection = getConnection();

    const query = "SELECT * FROM user WHERE id = ? AND passowrd = ?";

    console.log(password);

    return new Promise((resolve, reject) => {
      connection.query(query, [id, password], (err, results) => {
        if (err) {
          console.error("Database query error:", err);
          resolve(
            NextResponse.json(
              { error: "Database query error" },
              { status: 500 }
            )
          );
          return;
        }

        if (results.length > 0) {
          resolve(
            NextResponse.json({ message: "Login successful" }, { status: 200 })
          );
        } else {
          resolve(
            NextResponse.json(
              { message: "Invalid credentials" },
              { status: 401 }
            )
          );
        }
      });
    });
  } catch (error) {
    console.error("Request parsing error:", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

function hash(password) {

    return CryptoJS.SHA256(password).toString();

}
