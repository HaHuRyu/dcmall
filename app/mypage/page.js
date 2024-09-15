'use client'
import { useEffect, useState } from "react";
/*
24-09-15
마이페이지에 표시할 정보에 대해 의논하고,
다른 기능들의 작동을 재확인 해보자

모든 경로와 마이페이지 이상없음!
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
   return (
    <div>
        <h1>마이페이지에 온 것을 환영합니다.</h1>
        {signInType === null ? (
            <p>로딩 중...</p>
        ) : signInType === 0 ? (
            <div>
                <a href={`/mypage/withdraw?type=${signInType}`}><button>회원탈퇴</button></a>
                <a href='/mypage/resetpassword'><button>비밀번호 재설정</button></a>
                <a href='/keyword'><button>알림 서비스 이동</button></a>
                <h1>회원 정보 자리</h1>
                <a href='/mypage/changeemail'><button>이메일 변경</button></a>
            </div>
        ) : (
            <div>
                <a href={`/mypage/withdraw?type=${signInType}`}><button>회원탈퇴</button></a>
                <a href='/keyword'><button>알림 서비스 이동</button></a>
                <h1>구글 로그인 정보 자리</h1>
            </div>
        )}
    </div>
)
}
