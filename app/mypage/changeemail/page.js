'use client'
import { useState } from "react";
export default function ChangeEmail(){
    const [oldEmail, setOldEmail] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [emailToken, setEmailToken] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try{
            const response = await fetch('/api/post/mypage/verifyemail', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    oldEmail: oldEmail,
                    newEmail: newEmail
                })
            });
            const data = await response.json();
            alert(data.message);
        }catch(error){
            console.error("verifyEmail error: ", error);
        }
    }

    const handleChangeEmail = async (e) => {
        e.preventDefault();
        try{
            const response = await fetch('/api/post/mypage/changeemail', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    oldEmail: oldEmail,
                    newEmail: newEmail,
                    emailToken: emailToken
                })
            });
            const data = await response.json();
            alert(data.message);

            if(response.status == 200){
                window.location.href = '/mypage';
            }
        }catch(error){
            console.error("changeEmail error: ", error);
        }
    }
    return(
        <div>
            <h1>이메일 변경 페이지</h1>
            <form onSubmit={handleChangeEmail}>
                <p1>기존 이메일: </p1>
                <input type="email" value={oldEmail} onChange={(e) => setOldEmail(e.target.value)}/>
                <p1>새 이메일: </p1>
                <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)}/>
                <button onClick={handleSubmit}>인증번호 보내기</button>
                <p1>인증번호: </p1>
                <input type="text" value={emailToken} onChange={(e) => setEmailToken(e.target.value)}/>
                <button type="submit">이메일 변경</button>
            </form>
            
        </div>
    )
}