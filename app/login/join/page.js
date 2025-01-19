"use client";
import React, { useState } from 'react';
import { XSS_Sanitize } from '../../util/xssSanitize';
import styles from './Join.module.css';  // CSS Module 불러오기

export default function Join() {
  const [inputID, setInputID] = useState('');
  const [sanitizedOutputID, setSanitizedOutputID] = useState('');
  const [inputPW, setInputPW] = useState('');
  const [sanitizedOutputPW, setSanitizedOutputPW] = useState('');
  const [email, setEmail] = useState('');
  const [sanitizedOutputEmail, setSanitizedOutputEmail] = useState('');
  const [nickname, setNickname] = useState('');
  const [sanitizedOutPutNickname, setSanitizedOutPutNickname] = useState('');

  // 비밀번호 유효성 체크 (영문 대소문자+숫자+특수문자 포함 8자 이상)
  function passwordCheck(password) {
    const specialChars = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*\-]).{8,}$/;
    return specialChars.test(password);
  }

  return (
    <div className={styles.joinContainer}>
      <h2 className={styles.joinTitle}>회원가입</h2>

      <form action="/api/post/joinServer" method="POST" className={styles.joinForm}>
        {/* ID */}
        <label htmlFor="idSpace" className={styles.formLabel}>ID</label>
        <div className={styles.inputGroup}>
          <input
            type="text"
            id="idSpace"
            name="inputID"
            placeholder="ID를 입력하세요"
            className={styles.inputField}
            value={inputID}
            onChange={XSS_Sanitize(setInputID, setSanitizedOutputID)}
          />
          <button
            type="button"
            className={styles.checkButton}
            onClick={() => {
              // ID 중복확인 요청
              fetch("/api/post/idDupCheck", {
                method: "POST",
                body: JSON.stringify({ inputID: sanitizedOutputID }),
                headers: { "Content-Type": "application/json" }
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
        </div>

        {/* PW */}
        <label htmlFor="pwSpace" className={styles.formLabel}>PW</label>
        <input
          id="pwSpace"
          type="password"
          name="inputPW"
          placeholder="비밀번호를 입력하세요"
          className={styles.inputField}
          value={inputPW}
          onChange={XSS_Sanitize(setInputPW, setSanitizedOutputPW)}
          onInput={(e) => {
            const result = passwordCheck(sanitizedOutputPW);
            const checkBoxEl = document.getElementById("checkBox");
            if (checkBoxEl) {
              checkBoxEl.textContent = result
                ? "올바른 비밀번호 입니다."
                : "올바르지 않은 아이디와 비밀번호 입니다.";
            }
          }}
        />

        {/* E-mail */}
        <label htmlFor="emailSpace" className={styles.formLabel}>E-mail</label>
        <input
          id="emailSpace"
          type="email"
          name="email"
          placeholder="이메일 주소를 입력하세요"
          className={styles.inputField}
          value={email}
          onChange={XSS_Sanitize(setEmail, setSanitizedOutputEmail)}
        />

        {/* 닉네임 */}
        <label htmlFor="nickSpace" className={styles.formLabel}>닉네임</label>
        <div className={styles.inputGroup}>
          <input
            id="nickSpace"
            type="text"
            name="inputNickname"
            placeholder="닉네임을 입력하세요"
            className={styles.inputField}
            value={nickname}
            onChange={XSS_Sanitize(setNickname, setSanitizedOutPutNickname)}
          />
          <button
            type="button"
            className={styles.checkButton}
            onClick={() => {
              fetch("/api/post/nickDupCheck", {
                method: "POST",
                body: JSON.stringify({ usernick: sanitizedOutPutNickname }),
                headers: { "Content-Type": "application/json" }
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
        </div>

        <p id="checkBox" name="checkText" className={styles.checkBoxText}>
          올바르지 못한 아이디와 비밀번호 입니다.
        </p>

        <button type="submit" className={styles.submitButton}>회원가입</button>
      </form>
    </div>
  );
}
