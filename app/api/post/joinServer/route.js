import CryptoJS from 'crypto-js';
import {NextResponse} from "next/server"
import {getConnection} from "../../../_lib/db"

// @/ => 현재 앱의 최상위 경로
export async function POST(req){
    const text = await req.text();
    const params = new URLSearchParams(text);

    let userId = params.get("inputID");
    let userPw = params.get("inputPW");
    let isSafe = params.get("safePw") === "true";  //true false가 String 형태로 넘어와서 boolean으로 바꾸기 위한 작업

    const idCheck = checkID(userId);

    if(idCheck && isSafe){
        var hashPw = CryptoJS.SHA256(userPw).toString();

        //DB에 저장하는 부분을 집어 넣자
        const dbConnection = await getConnection();
        if(!dbConnection){
            return NextResponse.json({message : "DB Connect failed!"}, {status : 400});
        }else{
            const query = "insert into user(id, password) values (?, ?)"

            return new Promise((resolve, reject) => {
                dbConnection.query(query, [userId, hashPw], (err) => {
                    if(err){
                        console.error("id, password insert failed");
                        resolve(
                            NextResponse.json({message : "DataBase Query Error from joinServer"}, {status : 500})
                        );
                    }

                    resolve(
                        NextResponse.json({message : "Successful signIn"}, {status : 200})
                    );
                })
            })
        }

    }
    else{
        return NextResponse.json({message : "Please Check your id or password"}, {status : 400});
    }
}

function checkID(id) {
    //id도 나름의 기준이 존재하겠지만, 일단 띄어쓰기가 없고 아무것도 안 적은 방식 외에는 모두 OK로 할 예정(임시)
    if (!id.includes(" ") && id != null) {
        return true;
    }

    return false;
}