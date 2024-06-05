'use client'

import React from "react";
import { useState } from "react";
import { XSS_Sanitize } from "./util/xssSanitize";

export default function Home() {
  const [inputID, setInputID] = useState('');
  const [sanitizedOutputID, setSanitizedOutputID] = useState('');
  const [inputPW, setInputPW] = useState('');
  const [sanitizedOutputPW, setSanitizedOutputPW] = useState('');

  return (
    <div>
      <h4>dcmall</h4>

      <form action="/api/post/login" method="POST">
        <input type="text" placeholder="ID" name="id" id='id' value={sanitizedOutputID} onChange={XSS_Sanitize(setInputID, setSanitizedOutputID)}/>
        <input type="password" placeholder="PW" name="password" value={sanitizedOutputPW} onChange={XSS_Sanitize(setInputPW, setSanitizedOutputPW)}/>
        <button type="submit">login</button>
      </form>

      <a href="/join"><button>회원가입</button></a>
      <a href="/findID"><button>ID찾기</button></a>
      <a href="/findPW"><button>PW찾기</button></a>
    </div>
  );
}
