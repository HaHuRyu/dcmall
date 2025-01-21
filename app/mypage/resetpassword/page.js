'use client';
import { useState } from 'react';
import styles from '../mypage.module.css';

export default function ResetPassword() {
    const [oldPw, setOldPw] = useState('');
    const [newPw, setNewPw] = useState('');
    const [confirmPw, setConfirmPw] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (oldPw === '' || newPw === '' || confirmPw === '') {
                alert('모든 칸을 채워주세요.');
                return;
            }
            if (newPw !== confirmPw) {
                alert('새 비밀번호와 새 비밀번호 확인이 일치하지 않습니다.');
                return;
            }

            const response = await fetch('/api/post/mypage/resetpassword', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    oldPw: oldPw,
                    newPw: newPw,
                }),
            });
            const data = await response.json();
            alert(data.message);

            if (response.status === 200) {
                setOldPw('');
                setNewPw('');
                setConfirmPw('');
                window.location.href = '/';
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <div className={styles['mypage-container']}>
            <h1 className={styles['mypage-title']}>비밀번호 재설정</h1>
            <form onSubmit={handleSubmit} className={styles['input-group']}>
                <label htmlFor="old-pw">기존 비밀번호:</label>
                <input
                    id="old-pw"
                    type="password"
                    placeholder="기존 비밀번호"
                    value={oldPw}
                    onChange={(e) => setOldPw(e.target.value)}
                />
                <label htmlFor="new-pw">새 비밀번호:</label>
                <input
                    id="new-pw"
                    type="password"
                    placeholder="새 비밀번호"
                    value={newPw}
                    onChange={(e) => setNewPw(e.target.value)}
                />
                <label htmlFor="confirm-pw">새 비밀번호 확인:</label>
                <input
                    id="confirm-pw"
                    type="password"
                    placeholder="새 비밀번호 확인"
                    value={confirmPw}
                    onChange={(e) => setConfirmPw(e.target.value)}
                />
                <button type="submit" className={styles['mypage-button']}>
                    비밀번호 재설정
                </button>
            </form>
        </div>
    );
}
