'use client'
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
export default function Withdraw(){
    const [id, setId] = useState('');
    const [pw, setPw] = useState('');
    const [email, setEmail] = useState('');
    const searchParams = useSearchParams();
    const type = searchParams.get('type');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try{
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
            if(data.status === 200){
                alert(data.message);
                window.location.href = '/';
            }else{
                alert(data.message);
            }
        }catch(error){
            console.error("회원탈퇴 1장 오류: ", error);
        }
    }
    return(
        <div>
            <h1>회원탈퇴 페이지</h1>
            {(type == 0) ? (
                <div>
                    <p1>아이디: </p1>
                    <input type="text" value={id} onChange={(e) => setId(e.target.value)}/>
                    <p1>비밀번호: </p1>
                    <input type="password" value={pw} onChange={(e) => setPw(e.target.value)}/>
                    <p1>이메일: </p1>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}/>
                    <button onClick={handleSubmit}>회원탈퇴</button>
                </div>
            ):(
                <div>
                    <p1>이메일: </p1>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}/>
                    <button onClick={handleSubmit}>회원탈퇴</button>
                </div>
            )}
        </div>
    )
}