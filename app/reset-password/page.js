'use client'
import { useState } from 'react';
import { XSS_Sanitize } from '../util/xssSanitize';
import { useSearchParams } from 'next/navigation';
//토큰을 넘겨받고 토큰 관리 부분이 없는 것 같은데 확인 부탁
export default function Join() {
  const [password, setPassword] = useState('');
  const [sanitizedOutputPw, setSanitizedOutputPw] = useState('');
  const [password2, setPassword2] = useState('');
  const [sanitizedOutputPw2, setSanitizedOutputPw2] = useState('');
  const [isPasswordValid, setIsPasswordValid] = useState(false); // 비밀번호 유효성 상태 추가
  const tokenParam = useSearchParams().get('token');

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 비밀번호 유효성 검사
    if (!isPasswordValid) {
      alert('비밀번호를 확인해주세요.');
      return;
    }

    // 서버로 email과 id 데이터를 함께 제출
    const response = await fetch('/api/post/resetPwServer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        resetPw: setSanitizedOutputPw2,
        resetToken: tokenParam
      }),
    });

    const result = await responsze.json();

    // 응답 처리 (필요시)
    console.log(result);
  };

  return (
    <div>
      <h2>비밀번호 재설정</h2>
        <form onSubmit={handleSubmit}>
            <p>비밀번호</p>
                <input
                    type="password"
                    name="firstPassword"
                    id="firstPassword"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      XSS_Sanitize(setPassword, setSanitizedOutputPw);
                    }}
                />

            <p>비밀번호 확인</p>
                <input
                    type="password"
                    name="secondPassword"
                    id="secondPassword"
                    value={password2}
                    onChange={(e) => {
                      setPassword2(e.target.value);
                      XSS_Sanitize(setPassword2, setSanitizedOutputPw2);
                      setIsPasswordValid(finalPasswordCheck(sanitizedOutputPw, sanitizedOutputPw2)); // 비밀번호 유효성 확인
                    }}
                />
            <p id="checkBox" name="checkText">올바르지 않은 비밀번호 입니다.</p>

            {/* 유효한 비밀번호이고 두 비밀번호가 일치할 때 버튼 활성화 */}
            <button type="submit" disabled={!isPasswordValid || password !== password2} >비밀번호 재설정하기</button>
        </form>
      
    </div>
  );
}

function finalPasswordCheck(pw1, pw2){
    //정규표현식 영문 포함 + 숫자 포함 + 특수문자 + 길이 8자리 이상 문자열(반드시 모두 포함)
    console.log(pw1," // ",pw2);
    const specialChars = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;
    return specialChars.test(pw1) && (pw1 === pw2);
}
