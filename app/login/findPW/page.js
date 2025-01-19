"use client";
import React, { useState } from 'react';
import { XSS_Sanitize } from '../../util/xssSanitize';
import styles from './FindPW.module.css'; // CSS Module 임포트

export default function FindPW() {
  const [email, setEmail] = useState('');
  const [sanitizedOutputEmail, setSanitizedOutputEmail] = useState('');
  const [id, setId] = useState('');
  const [sanitizedOutputId, setSanitizedOutputId] = useState('');
  const [email_token, setEmail_token] = useState('');
  const [sanitizedOutputemail_token, setSanitizedOutputemail_token] = useState('');

  // 1) 서버에 email, id 전송하여 토큰 발급
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/post/sendEmailServer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: sanitizedOutputEmail,
          id: sanitizedOutputId
        })
      });
      const data = await response.json();

      // 응답 메시지 표시
      alert(data.message);
    } catch (error) {
      console.error('비밀번호 찾기 - 이메일 전송 오류:', error);
      alert('오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  // 2) 발급된 토큰(email_token)으로 사용자 확인 후 비밀번호 리셋 링크 이동
  const handler = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/post/findPwServer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: sanitizedOutputemail_token
        })
      });
      const result = await response.json();

      if (response.status === 200) {
        // 발급된 resetLink로 이동
        window.location.href = result.message;
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('비밀번호 찾기 - 토큰 확인 오류:', error);
      alert('오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <div className={styles.findPwContainer}>
      <h2 className={styles.findPwTitle}>비밀번호 찾기</h2>

      <form onSubmit={handleSubmit} className={styles.findPwForm}>
        <label htmlFor="email" className={styles.formLabel}>E-mail</label>
        <input
          id="email"
          type="email"
          name="email"
          className={styles.inputField}
          placeholder="가입하신 이메일 주소"
          value={email}
          onChange={XSS_Sanitize(setEmail, setSanitizedOutputEmail)}
        />

        <label htmlFor="inputId" className={styles.formLabel}>ID</label>
        <input
          id="inputId"
          type="text"
          name="inputId"
          className={styles.inputField}
          placeholder="가입하신 ID"
          value={id}
          onChange={XSS_Sanitize(setId, setSanitizedOutputId)}
        />

        <button type="submit" className={styles.submitButton}>이메일 전송</button>
      </form>

      <form onSubmit={handler} className={styles.findPwForm}>
        <label htmlFor="email_token" className={styles.formLabel}>사용자 확인 토큰</label>
        <input
          id="email_token"
          type="text"
          name="email_token"
          className={styles.inputField}
          placeholder="발급받은 토큰"
          value={email_token}
          onChange={XSS_Sanitize(setEmail_token, setSanitizedOutputemail_token)}
        />

        <button type="submit" className={styles.submitButton}>토큰 확인</button>
      </form>
    </div>
  );
}
