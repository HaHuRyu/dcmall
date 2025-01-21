'use client';
import { useState } from 'react';
import styles from '../mypage.module.css';

export default function ChangeEmail() {
    const [oldEmail, setOldEmail] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [emailToken, setEmailToken] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/post/mypage/verifyemail', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    oldEmail: oldEmail,
                    newEmail: newEmail,
                }),
            });
            const data = await response.json();
            alert(data.message);
        } catch (error) {
            console.error('verifyEmail error: ', error);
        }
    };

    const handleChangeEmail = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/post/mypage/changeemail', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    oldEmail: oldEmail,
                    newEmail: newEmail,
                    emailToken: emailToken,
                }),
            });
            const data = await response.json();
            alert(data.message);

            if (response.status === 200) {
                window.location.href = '/mypage';
            }
        } catch (error) {
            console.error('changeEmail error: ', error);
        }
    };

    return (
        <div className={styles['mypage-container']}>
            <h1 className={styles['mypage-title']}>이메일 변경 페이지</h1>
            <form onSubmit={handleChangeEmail} className={styles['input-group']}>
                <label htmlFor="old-email">기존 이메일:</label>
                <input
                    id="old-email"
                    type="email"
                    value={oldEmail}
                    onChange={(e) => setOldEmail(e.target.value)}
                />
                <label htmlFor="new-email">새 이메일:</label>
                <input
                    id="new-email"
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                />
                <button
                    type="button"
                    onClick={handleSubmit}
                    className={styles['mypage-button']}
                >
                    인증번호 보내기
                </button>
                <label htmlFor="email-token">인증번호:</label>
                <input
                    id="email-token"
                    type="text"
                    value={emailToken}
                    onChange={(e) => setEmailToken(e.target.value)}
                />
                <button type="submit" className={styles['mypage-button']}>
                    이메일 변경
                </button>
            </form>
        </div>
    );
}
