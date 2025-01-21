'use client';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import styles from '../mypage.module.css'; // 기존 스타일 파일 사용

export default function Withdraw() {
    const [id, setId] = useState('');
    const [pw, setPw] = useState('');
    const [email, setEmail] = useState('');
    const searchParams = useSearchParams();
    const type = searchParams.get('type');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/post/mypage/withdraw', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: id,
                    pw: pw,
                    email: email,
                    type: type,
                }),
            });
            const data = await response.json();
            if (response.status === 200) {
                alert(data.message);
                window.location.href = '/';
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error('회원탈퇴 요청 오류: ', error);
        }
    };

    return (
        <div className={styles['mypage-container']}>
            <h1 className={styles['mypage-title']}>회원탈퇴</h1>
            <form onSubmit={handleSubmit} className={styles['input-group']}>
                {type == 0 && (
                    <>
                        <label htmlFor="id">아이디:</label>
                        <input
                            id="id"
                            type="text"
                            value={id}
                            placeholder="아이디를 입력하세요"
                            onChange={(e) => setId(e.target.value)}
                        />
                        <label htmlFor="pw">비밀번호:</label>
                        <input
                            id="pw"
                            type="password"
                            value={pw}
                            placeholder="비밀번호를 입력하세요"
                            onChange={(e) => setPw(e.target.value)}
                        />
                    </>
                )}
                <label htmlFor="email">이메일:</label>
                <input
                    id="email"
                    type="email"
                    value={email}
                    placeholder="이메일을 입력하세요"
                    onChange={(e) => setEmail(e.target.value)}
                />
                <button type="submit" className={styles['mypage-button']}>
                    회원탈퇴
                </button>
            </form>
        </div>
    );
}
