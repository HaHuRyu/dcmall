import CryptoJS from 'crypto-js';
import {NextResponse} from "next/server"
import {getConnection} from "../../../_lib/db"

//ID의 중복 확인과, pw 올바른 형식 한 번 더 확인하기
// @/ => 현재 앱의 최상위 경로
//클라이언트 단에서 변조할 가능성을 염두해 서버에서 이중체크(크로스체크)
export async function POST(req){
    const text = await req.text();
    const params = new URLSearchParams(text);

    let userId = params.get("inputID");
    let userPw = params.get("inputPW");
    const safePw = finalPasswordCheck(userPw);

    const safeId = finalIdCheck(userId);

    if(safeId && safePw){
        var hashPw = CryptoJS.SHA256(userPw).toString();

        //DB에 저장하는 부분을 집어 넣자
        const dbConnection = await getConnection();
        
        const query = "insert into user(id, password) values (?, ?)"

            return new Promise((resolve, reject) => {
                dbConnection.query(query, [userId, hashPw], (err) => {
                    if(err){
                        reject(
                            NextResponse.json({message : "DataBase Query Error from joinServer"}, {status : 500})
                        );
                    }

                    resolve(
                        NextResponse.json({message : "Successful signIn"}, {status : 200})
                    );
                })
            })

    }
    else{
        return NextResponse.json({message : "Please Check your id or password"}, {status : 400});
    }
}

async function finalIdCheck(id) {
    // 정규식을 사용하여 한글이 포함되어 있는지 확인
    const hasHangul = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(id);

    // id도 나름의 기준이 존재하겠지만, 일단 띄어쓰기가 없고 아무것도 안 적은 방식 외에는 모두 OK로 할 예정(임시)
    if (id !== null && !id.includes(" ") && id.length <= 50 && !hasHangul) {
        const connection = getConnection();

        if (!connection) {
            console.log("DB Connect Failed from joinServer");
            return false;
        } else {
            const query = "SELECT COUNT(id) AS count FROM user WHERE id = ?";

            return new Promise((resolve, reject) => {
                connection.query(query, [id], (err, results) => {
                    if (err) {
                        console.error("Database query error from joinSever: ", err);
                        return false;
                    } else {
                        const count = results[0].count;

                        if (count === 0) {
                            return true;
                        } else {
                            return false;
                        }
                    }
                });
            });
        }
    }

    return false;
}

function finalPasswordCheck(password){
    //정규표현식 영문 포함 + 숫자 포함 + 특수문자 + 길이 8자리 이상 문자열(반드시 모두 포함)
    const specialChars = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;
    return specialChars.test(password);
}