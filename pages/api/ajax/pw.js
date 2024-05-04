

export default function handler(req, res)
{
    if(req.method == "POST")
    {
        const inputPW = req.body.password;
    
        let result = checkPassword(inputPW);

        console.log("Result: "+result);

        if(result)
        {
            return res.json("올바른 비밀번호 입니다");
        }
        else
        {
            return res.json("올바르지 않은 비밀번호 입니다");
        }
    }
}

function checkPassword(password)
{
    //정규표현식 영문 포함 + 숫자 포함 + 특수문자 + 길이 8자리 이상 문자열(반드시 모두 포함)
    const specialChars = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;
    return specialChars.test(password);
}
