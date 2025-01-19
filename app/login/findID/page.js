"use client";
import React, { useState } from 'react';
import { XSS_Sanitize } from '../../util/xssSanitize';
import styles from './FindID.module.css'; // CSS Module

export default function FindID() {
  const [email, setEmail] = useState('');
  const [sanitizedOutputEmail, setSanitizedOutputEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/post/findIDServer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: sanitizedOutputEmail })
      });
      const data = await response.json();
      alert(data.message);
    } catch (error) {
      console.error('ID 찾기 오류:', error);
      alert('오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <div className={styles.findContainer}>
      <h2 className={styles.findTitle}>ID 찾기</h2>

      <form onSubmit={handleSubmit} className={styles.findForm}>
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

        <button type="submit" className={styles.submitButton}>확인</button>
      </form>
    </div>
  );
}
