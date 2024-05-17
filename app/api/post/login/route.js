import { NextResponse } from 'next/server';
import { getConnection } from '../../../_lib/db';
import CryptoJS from 'crypto-js';
import jwt from 'jsonwebtoken';
import { setCookie } from 'cookies-next';

export async function POST(req) {
  try {
    const text = await req.text();
    const params = new URLSearchParams(text);
    const id = params.get('id');
    let password = params.get('password');

    password = hash(password); // 비밀번호 해시 처리

    const connection = getConnection();

    const query = 'SELECT * FROM user WHERE id = ? AND password = ?';

    return new Promise((resolve, reject) => {
      connection.query(query, [id, password], (err, results) => {
        if (err) {
          console.error('Database query error:', err);
          resolve(
            NextResponse.json(
              { error: 'Database query error' },
              { status: 500 }
            )
          );
          return;
        }

        if (results.length > 0) {
          // 사용자가 존재하고 비밀번호가 맞는 경우
          const user = results[0];
          const token = jwt.sign(
            { id: user.id, name: user.name },
            process.env.SECRET_KEY,
            { expiresIn: '1h' }
          );
          // JWT 토큰을 쿠키에 설정
          const response = NextResponse.json(
            { message: 'Login successful' },
            { status: 200 }
          );
          response.cookies.set('session-token', token, {
            path: '/',
            maxAge: 60 * 60 * 1, // 1시간
            httpOnly: true, // 클라이언트에서 쿠키를 읽지 못하도록 설정
            secure: process.env.NODE_ENV === 'production', // 프로덕션 환경에서는 secure 속성 활성화
          });

          resolve(response); // 로그인 성공 응답 반환
        } else {
          // 사용자가 존재하지 않거나 비밀번호가 틀린 경우
          resolve(
            NextResponse.json(
              { message: 'Invalid credentials' },
              { status: 401 }
            )
          ); // 로그인 실패 응답 반환
        }
      });
    });
  } catch (error) {
    console.error('Request parsing error:', error);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 }); // 요청 파싱 오류 응답 반환
  }
}

function hash(password) {
  // 비밀번호를 SHA256으로 해시 처리
  return CryptoJS.SHA256(password).toString();
}
