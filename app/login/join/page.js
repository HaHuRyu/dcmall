'use client'
import { useState } from 'react';
import { XSS_Sanitize } from '../../util/xssSanitize';

export default function Join() {
  const [inputID, setInputID] = useState('');
  const [sanitizedOutputID, setSanitizedOutputID] = useState('');
  const [inputPW, setInputPW] = useState('');
  const [sanitizedOutputPW, setSanitizedOutputPW] = useState('');
  const [email, setEmail] = useState('');
  const [sanitizedOutputEmail,setSanitizedOutputEmail] = useState('');
  const [nickname, setNickname] = useState('');
  const [sanitizedOutPutNickname, setSanitizedOutPutNickname] = useState('');

  return (
    <div>
      <h2>회원가입</h2>

      <form action="/api/post/joinServer" method="POST">
        <p>ID:</p>
        <input
          type="text"
          id="idSpace"
          placeholder="ID를 입력하세요"
          name="inputID"
          value={inputID}
          onChange={XSS_Sanitize(setInputID, setSanitizedOutputID)}
        />
        <button
          type="button"
          id="DuplicationBtn"
          onClick={() => {
            var userId = document.getElementById("idSpace").value;

            fetch("/api/post/idDupCheck", {
              method: "POST",
              body: JSON.stringify({ inputID: sanitizedOutputID }),
              headers: {
                "Content-Type": "application/json"
              }
            })
              .then((r) => r.json())
              .then((data) => {
                if (data.message) {
                  alert(data.message);
                }
              })
              .catch((error) => {
                console.error("ID error:", error);
                alert("An error occurred while checking the ID.");
              });
          }}
        >
          중복확인
        </button>

        <p>PW:</p>
        <input
          type="password"
          placeholder="비밀번호를 입력하세요"
          name="inputPW"
          value={inputPW}
          onChange={XSS_Sanitize(setInputPW, setSanitizedOutputPW)}
          onInput={(e) => {
            //let result = passwordCheck(e.target.value);
            let result = passwordCheck(sanitizedOutputPW);

            if (result) {
              document.getElementById("checkBox").textContent =
                "올바른 비밀번호 입니다.";
            } else {
              document.getElementById("checkBox").textContent =
                "올바르지 않은 아이디와 비밀번호 입니다.";
            }
          }}
        />
        
        <p>E-mail</p>
        <input
          type="email"
          name="email"
          value={email}
          onChange={XSS_Sanitize(setEmail, setSanitizedOutputEmail)}
          />

          <p>닉네임</p>
          <input
          type="text"
          id="nickSpace"
          name="inputNickname"
          value={nickname}
          onChange={XSS_Sanitize(setNickname, setSanitizedOutPutNickname)}
        />
        <button
          type="button"
          id="DupNickBtn"
          onClick={() => {
            var userNick = document.getElementById("nickSpace").value;

            fetch("/api/post/nickDupCheck", {
              method: "POST",
              body: JSON.stringify({ usernick : sanitizedOutPutNickname }),
              headers: {
                "Content-Type": "application/json"
              }
            })
              .then((r) => r.json())
              .then((data) => {
                if (data.message) {
                  alert(data.message);
                }
              })
              .catch((error) => {
                console.error("Nick error:", error);
                alert("An error occurred while checking the Nick.");
              });
          }}
        >
          중복확인
        </button>

        <p id="checkBox" name="checkText">올바르지 못한 아이디와 비밀번호 입니다.</p>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

function passwordCheck(password) {
  // 정규표현식 영문 포함 + 숫자 포함 + 특수문자 + 길이 8자리 이상 문자열(반드시 모두 포함)
  const specialChars = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;
  return specialChars.test(password);
}
