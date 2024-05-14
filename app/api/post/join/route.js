import CryptoJS from 'crypto-js';

// @/ => 현재 앱의 최상위 경로
export default function handler(req, res)
{
    if(req.method == "POST")
    {
        const userID = req.body.inputID;
        const userPW = req.body.inputPW;
        const isSafe = req.body.safePassword === "true";    //string으로 넘어오기 때문에 여기서 true인지 한 번 더 확인해줘야하는 뻘짓이 필요하다

        const finalCheck = checkID(userID);

        if(finalCheck && isSafe)
        {
            console.log("합법적인 회원가입 "+isSafe+" // "+finalCheck);

            //올바른 형식과 올바른 형식의 비밀번호 (저장 진행)
            var hashPW = CryptoJS.SHA256(userPW).toString();    //WordArray라는 형식으로 리턴 되기 때문에 값이 같아도 비교하면 무조건 false로 나와 String으로 변경시켜 줘야 한다.

            setStoreID(userID);
            setStorePW(hashPW);

            return res.status(200).redirect(302,'/');
        }
        else
        {
            console.log("불법적인 회원가입 "+isSafe+" // "+finalCheck);

            //어느 하나라도 모자른 것 리다이렉트 진행
            return res.status(400).redirect(302,'/join')
        }
    }
}

function checkID(id)
{
    //id도 나름의 기준이 존재하겠지만, 일단 띄어쓰기가 없고 아무것도 안 적은 방식 외에는 모두 OK로 할 예정(임시)
    if(!id.includes(" ") && id != null)
    {
        return true;
    }

    return false;
}


