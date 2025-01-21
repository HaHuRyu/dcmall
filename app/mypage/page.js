// mypage.js
'use client';
import { useEffect, useState } from "react";
import styles from './mypage.module.css';

export default function Mypage() {
    const [signInType, setSignInType] = useState(null);
    const [nickName, setNickName] = useState('');

    useEffect(() => {
        const temp = sessionStorage.getItem('usernick');
        setNickName(temp || '');
    }, []);

    useEffect(() => {
        const fetchSignInType = async () => {
            const response = await fetch('/api/getSignInType', {
                method: 'POST',
            });
            const data = await response.json();

            if (response.status === 200) {
                setSignInType(data.message);
            }
        };

        if (signInType === null) {
            fetchSignInType();
        }
    }, [signInType]);

    return (
        <div className={styles['mypage-container']}>
            <h1 className={styles['mypage-title']}>마이페이지에 온 것을 환영합니다.</h1>
            {signInType === null ? (
                <p className={styles['loading']}>로딩 중...</p>
            ) : signInType === 0 ? (
                <div className={styles['button-group']}>
                    <a href={`/mypage/withdraw?type=${signInType}`}><button className={styles['mypage-button']}>회원탈퇴</button></a>
                    <a href='/mypage/resetpassword'><button className={styles['mypage-button']}>비밀번호 재설정</button></a>
                    <a href='/keyword'><button className={styles['mypage-button']}>알림 서비스 이동</button></a>
                    {nickName === '' ? (
                        <h1 className={styles['error-message']}>회원 정보를 찾지 못했습니다</h1>
                    ) : (
                        <h1 className={styles['nickname']}>닉네임: {nickName}</h1>
                    )}
                    <a href='/mypage/changeemail'><button className={styles['mypage-button']}>이메일 변경</button></a>
                </div>
            ) : (
                <div className={styles['button-group']}>
                    <a href={`/mypage/withdraw?type=${signInType}`}><button className={styles['mypage-button']}>회원탈퇴</button></a>
                    <a href='/keyword'><button className={styles['mypage-button']}>알림 서비스 이동</button></a>
                    {nickName === '' ? (
                        <h1 className={styles['error-message']}>회원 정보를 찾지 못했습니다</h1>
                    ) : (
                        <h1 className={styles['nickname']}>닉네임: {nickName}</h1>
                    )}
                </div>
            )}
        </div>
    );
}
