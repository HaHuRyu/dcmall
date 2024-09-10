"use client"
import React, { useEffect, useState } from "react";

export default function KeyWord(){
    const [token, setToken] = useState('');

    useEffect(() => {
        const fetchToken = async () => {
            try {
                const response = await fetch('/api/generateToken');
                const data = await response.json();
                if (response.ok) {
                    if (data.token) {
                        setToken(data.token);
                    } else {
                        console.log(data.message); // "이미 인증되었습니다." 메시지 로깅
                    }
                } else {
                    console.error("토큰 생성 실패:", data.error);
                }
            } catch (error) {
                console.error("토큰 요청 중 오류 발생:", error);
            }
        };

        fetchToken();
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();
    
        const formData = new FormData(event.target); 
        const formObject = {}; 
    
        formData.forEach((value, key) => {
            formObject[key] = value;
        });
        
        const searchText = JSON.stringify({...formObject, token});
        console.log("asa" + searchText);

        if(formObject.title === "" || formObject.threshold === ""){
            alert("알림 제목 또는 한계점을 입력하주세요.")
        } else {
            try{
                const response = await fetch('api/post/embedding',{
                    method : "post",
                    headers: {
                        'Content-Type' : 'application/json'
                      },
                      body: searchText
                });
                const data = await response.json();
                console.log("log" + data.check);
                if(data.check === 200){
                    alert("알림 서비스가 등록 되었습니다.")
                    setToken(''); // 알림 서비스 등록 후 토큰 초기화
                }else{
                    alert("오류가 발생하였습니다 관리자에게 문의해주세요")
                }
            } catch(error){
                console.log("error" + error)
            }
        }
    };

    return(
        <div>
            <form onSubmit={handleSubmit} id="handler">
                <input type="text" name="title"/>
                <br/>
                <input type="number" name="threshold"/>
                <br/>
                <button type="submit">설정</button>
            </form>
            {token && (
                <>
                    <p>토큰: {token}</p>
                    <a href="https://discord.gg/WFxrYbyBVF" target="blank">discord link</a>
                </>
            )}
        </div>
    )
}