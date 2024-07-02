'use client'
import React, { useState } from 'react';
import { XSS_Sanitize } from '../util/xssSanitize';

export default function deleteId() {
    const [inputID, setInputID] = useState('');
    const [sanitizedOutputID, setSanitizedOutputID] = useState('');
    const [inputPW, setInputPW] = useState('');
    const [sanitizedOutputPW, setSanitizedOutputPW] = useState('');

    // 쿠키 값을 가져오는 헬퍼 함수
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // 첫 번째 요청: 비밀번호 확인
            const response = await fetch('/api/post/deleteUser', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id: sanitizedOutputID,
                    password: sanitizedOutputPW,
                    confirm: false
                })
            });

            const data = await response.json();

            if (response.status === 200 && data.confirm) {
                if (confirm(data.message)) {
                    // 두 번째 요청: 실제 삭제
                    const deleteResponse = await fetch('/api/post/deleteUser', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            id: sanitizedOutputID,
                            password: sanitizedOutputPW,
                            confirm: true
                        })
                    });

                    const deleteData = await deleteResponse.json();

                    alert(deleteData.message);
                    if (deleteResponse.status === 200) {
                        window.location.href = '/';
                    } else {
                        console.error("User deletion failed");
                    }
                }
            } else {
                alert(data.message);
            }
        } catch (err) {
            console.error("deleteId Error: " + err);
        }
    };

    return (
        <div>
            <h1>아이디 삭제</h1>
            <form onSubmit={handleSubmit}>
                <h4>ID:</h4>
                <input
                    type="text"
                    placeholder="ID를 입력하세요"
                    value={sanitizedOutputID}
                    onChange={XSS_Sanitize(setInputID, setSanitizedOutputID)}
                />

                <h4>비밀번호:</h4>
                <input
                    type='password'
                    placeholder='비밀번호를 입력하세요'
                    value={sanitizedOutputPW}
                    onChange={XSS_Sanitize(setInputPW, setSanitizedOutputPW)}
                />

                <button type='submit'>제출하기</button>
            </form>
        </div>
    );
}
