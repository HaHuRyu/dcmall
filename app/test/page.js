'use client';  // 이 지시문을 추가하여 클라이언트 컴포넌트로 지정

import { useEffect, useState } from "react";
import axios from 'axios';

export default function Test() {
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchMessage = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/message');
                setMessage(response.data);
            } catch (err) {
                console.log("test Error: " + err);
            }
        };

        fetchMessage(); // 비동기 함수 호출
    }, []);

    const sendToServer = () => {
        fetch('http://localhost:8080/tempServer', {
            method: 'POST',
            body: JSON.stringify({ Key: 'I am Next.js' }),
            headers: {
                "Content-Type": "application/json"
            }
        })
        .then(response => response.text())
        .then(data => console.log("Response from server: " + data))
        .catch(error => console.error("Error sending data: " + error));
    };

    return (
        <div>
            <h1>{message}</h1>

            <button onClick={sendToServer}>sendToServer</button>
        </div>
    );
}
