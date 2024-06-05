import DOMpurify from 'dompurify';
/*
XSS 공격을 방지하기 위한 코드 DOMpurify를 통해 <div> 등
input에 태그를 붙인 입력값을 검열해준다.
*/
export function XSS_Sanitize(setInput, setsanitizedOutput){
    return (e) => {
        const userInput = e.target.value;
        setInput(userInput);

        const sanitized = DOMpurify.sanitize(userInput);
        setsanitizedOutput(sanitized);
        
    }
}