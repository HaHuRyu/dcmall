'use client'
import { useState } from 'react';

export default function Join() {
  const [isSafePassword, setIsSafePassword] = useState('false');  //올바른 비밀번호 여부를 joinServer에 넘겨주기 위한 별도의 변수
    return (
      <div>
        <h2>회 원 가 입</h2>

        <form action="/api/post/joinServer" method = "POST">
            <p>ID : </p>
            <input type="text" placeholder="ID를 입력하시오." name = "inputID"/>

            <p>PW : </p>
            <input type="password" placeholder="PW를 입력하시오." name = "inputPW" onInput={(e) => {
              fetch("/api/ajax/pwCheck", { // 서버의 "/api/ajax/pw" 엔드포인트에 요청을 보냅니다.
                method: 'POST', 
                headers: {
                  'Content-Type': 'application/json', // 서버에 JSON 형태의 데이터임을 알립니다.
                },
                body: JSON.stringify({ password: e.target.value }), // input 필드의 값을 password 키에 할당하여 JSON 형식으로 전송합니다.
              })
              .then((r) => r.json()) // 서버 응답을 JSON 형식으로 파싱합니다.
              .then((data) => { // 파싱된 JSON 데이터를 data 변수에 저장합니다.
                if(data.message === "safe"){
                  setIsSafePassword(true);
                  document.getElementById("checkBox").textContent = "올바른 아이디와 비밀번호 입니다.";
                }else{
                  setIsSafePassword(false);
                  document.getElementById("checkBox").textContent = "올바르지 못한 아이디와 비밀번호 입니다."; 
                }
                
              })
              .catch((error) => console.error('Error:', error)); // 에러가 발생하면 콘솔에 에러 메시지를 출력합니다.
            }}>

            </input>

            <p id = "checkBox" name = "checkText">올바르지 못한 아이디와 비밀번호 입니다.</p>
            <input type="hidden" id="safePw" name="safePw" value={isSafePassword} />
            <button type="submit">Submit</button>
        </form>
      </div>
    );
  }
  