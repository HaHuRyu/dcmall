'use client'
import { useEffect, useState } from "react";
/*
deleteId 존재 (커스텀 로그인 용)
구글용 deleteId는 별도 제작 (구글 이메일로 역추적에서 지워야 함)

비밀번호 재설정은 기존의 등록된 이메일에 인증번호를 보내 인증을 하고 바꿔주었는데,
이 인증과정을 생략해야 하나...? 그냥 기존의 reset-password에 보내려고 했는데 resetToken을 확인하네...;

이메일 변경
바꿀 이메일에 인증 번호를 보내서 그 인증번호를 입력하게 해서 인증하는 방식으로 하면 될 듯
*/
export default function Mypage(){
    const [signInType, setSignInType] = useState(null);

   useEffect(() => {
    const fetchSignInType = async () => {
        const response = await fetch('/api/getSignInType', {
            method: 'POST',
        });
        const data = await response.json();

        if(response.status === 200){
            setSignInType(data.message);
        }
    }

    if(signInType === null){
        fetchSignInType();
    }
   },[])
    return( //signInType이 null인 것도 문제고 404가 뜬다.
        <div>
            <h1>마이페이지에 온 것을 환영한다.</h1>
            {signInType ===  0 ? (
                <div>
                    <a href = {`/withdraw?type=${signInType}`}><button>회원탈퇴</button></a>
                    <a href = '../login/reset-password'><button>비밀번호 재설정</button></a>
                    <button>알림 서비스 이동</button>
                    <h1>회원 정보 자리</h1>
                    <button>이메일 변경</button>
                </div>
            ) : (
                <div>
                    <a href = {`/withdraw?type=${signInType}`}><button>회원탈퇴</button></a>
                    <button>알림 서비스 이동</button>
                    <h1>구글 로그인 정보 자리</h1>
                </div>
            )}
        </div>
    )
}
