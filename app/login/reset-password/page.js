'use client';
import { useState } from 'react';
import { XSS_Sanitize } from '../../util/xssSanitize'; // XSS 방어 유틸리티
import { useSearchParams } from 'next/navigation';
import styles from './restPassword.module.css'; // 새로운 CSS 파일 추가

export default function ResetPassword() {
    const [password, setPassword] = useState('');
    const [sanitizedOutputPw, setSanitizedOutputPw] = useState('');
    const [password2, setPassword2] = useState('');
    const [sanitizedOutputPw2, setSanitizedOutputPw2] = useState('');
    const [isPasswordValid, setIsPasswordValid] = useState(false); // 비밀번호 유효성 상태
    const tokenParam = useSearchParams().get('token');

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 비밀번호 유효성 검사
        if (!isPasswordValid) {
            alert('비밀번호를 확인해주세요.');
            return;
        }

        // 서버로 resetToken과 비밀번호 데이터를 제출
        const response = await fetch('/api/post/resetPwServer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                resetPw: password2,
                resetToken: tokenParam,
            }),
        });

        const result = await response.json();
        alert(result.message);
        window.location.href = '/';
    };

    return (
        <div className={styles['reset-password-container']}>
            <h2 className={styles['reset-password-title']}>비밀번호 재설정</h2>
            <form onSubmit={handleSubmit} className={styles['reset-password-form']}>
                <div className={styles['input-group']}>
                    <label htmlFor="password">비밀번호</label>
                    <input
                        id="password"
                        type="password"
                        value={sanitizedOutputPw}
                        onChange={XSS_Sanitize(setPassword, setSanitizedOutputPw)}
                        placeholder="새 비밀번호를 입력하세요"
                        className={styles['reset-password-input']}
                    />
                </div>
                <div className={styles['input-group']}>
                    <label htmlFor="password2">비밀번호 확인</label>
                    <input
                        id="password2"
                        type="password"
                        value={sanitizedOutputPw2}
                        onChange={XSS_Sanitize(setPassword2, setSanitizedOutputPw2)}
                        onBlur={() =>
                            setIsPasswordValid(finalPasswordCheck(sanitizedOutputPw, sanitizedOutputPw2))
                        }
                        placeholder="비밀번호를 다시 입력하세요"
                        className={styles['reset-password-input']}
                    />
                </div>
                <button
                    type="submit"
                    disabled={!isPasswordValid || sanitizedOutputPw !== sanitizedOutputPw2}
                    className={`${styles['reset-password-button']} ${
                        (!isPasswordValid || sanitizedOutputPw !== sanitizedOutputPw2) &&
                        styles['reset-password-button-disabled']
                    }`}
                >
                    비밀번호 재설정하기
                </button>
            </form>
        </div>
    );
}

function finalPasswordCheck(pw1, pw2) {
    // 정규표현식: 영문 + 숫자 + 특수문자 포함 + 최소 8자 이상
    const specialChars = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;
    return specialChars.test(pw1) && pw1 === pw2;
}
