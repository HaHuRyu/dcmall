'use client'
import { useState } from "react";

export default function ResetPassword(){
    const [oldPw, setOldPw] = useState('');
    const [newPw, setNewPw] = useState('');
    const [confirmPw, setConfirmPw] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try{
            if(oldPw === '' || newPw === '' || confirmPw === ''){
                alert('모든 칸을 채워주세요.');
                return;
            }
            if(newPw !== confirmPw){
                alert('새 비밀번호와 새 비밀번호 확인이 일치하지 않습니다.');
                return;
            }

           const response = await fetch('/api/post/mypage/resetpassword', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                oldPw: oldPw,
                newPw: newPw,
            })
           });
           const data = await response.json();
           alert(data.message);

           if(response.status === 200){
            setOldPw('');
            setNewPw('');
            setConfirmPw('');
            window.location.href = '/';
           }
        }
        catch(error){
            console.error('Error:', error);
        }
    }
    return(
        <div>
            <h1>비밀번호 재설정</h1>
            <p1>기존 비밀번호: </p1>
            <input type = "password" placeholder = "기존 비밀번호" onChange = {(e) => setOldPw(e.target.value)}/>
            <p1>새 비밀번호: </p1>
            <input type = "password" placeholder = "새 비밀번호" onChange = {(e) => setNewPw(e.target.value)}/>
            <p1>새 비밀번호 확인: </p1>
            <input type = "password" placeholder = "새 비밀번호 확인" onChange = {(e) => setConfirmPw(e.target.value)}/>
            <button onClick = {handleSubmit}>비밀번호 재설정</button>
        </div>
    )
}