// lib/db.js
/*
왜 mysql2/promise를 사용해야 하는가?
프로미스 기반 API: 비동기 작업을 더 쉽게 관리하고, async/await 구문을 사용하여 비동기 코드의 가독성을 높일 수 있습니다.
콜백 기반 API: 더 복잡한 콜백 헬(callback hell)을 피하기 어려울 수 있습니다.
*/
import mysql from 'mysql2/promise';
import crypto from 'crypto';

let connection;

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
  
export async function getConnection() {
return await pool.getConnection();
}

export async function queryDatabase(id) {
    const connection = await getConnection();
    const query = "SELECT * FROM user WHERE id = ?";

    try {
        const [rows, fields] = await connection.query(query, [id]);
        console.log("Rows:", rows);
        console.log("Fields:", fields);
        return rows;
    } catch (error) {
        console.error("Error executing query:", error);
        throw error;
    } finally {
        if (connection) {
            await connection.end(); // 연결 닫기
        }
    }
}

export async function idCheck(id) {
    // 정규식을 사용하여 한글이 포함되어 있는지 확인
    const hasHangul = idStringCheck(id);

    if (id !== null && !id.includes(" ") && id.length <= 50 && !hasHangul) {
        const connection = await getConnection();
        const query = "SELECT COUNT(id) AS count FROM user WHERE id = ?";

        try{
            const results = await connection.query(query, [id]);

            if (results[0][0].count == 0) 
                return { message: "사용할 수 있는 ID", status: 200 };
            
            return { message: "이미 존재하는 ID", status: 200 };
        }catch(error){
            console.log("idCheck error: "+error);
            return {message : "Database query error", status: 500};
        }finally{
            if(connection)
                await connection.end();
        }
    }

    return { message: "다른 ID를 사용해주십시오.", status: 400 };
}

export async function nickCheck(nick){

    if(nick !== null && !nick.includes(" ") && nick.length <= 20){
        const connection = await getConnection();
        const query = "SELECT COUNT(nickname) AS count From userinfo WHERE nickname = ?";
        try{
            const results = await connection.query(query, [nick]);

            if (results[0][0].count == 0) 
                return { message: "사용할 수 있는 닉네임", status: 200 };
            
            return { message: "이미 존재하는 닉네임", status: 200 };
        }catch(error){
            console.log("nickCheck error: "+error);
            return {message : "Database query error", status: 500};
        }finally{
            if(connection)
                await connection.end();
        }
    }
    return { message: "다른 닉네임을 사용해주십시오.", status: 400 };
}

export async function finalIdCheck(id) {
    // 정규식을 사용하여 한글이 포함되어 있는지 확인
    const hasHangul = idStringCheck(id);

    if (id !== null && !id.includes(" ") && id.length <= 50 && !hasHangul) {
        const connection = await getConnection();
        const query = "SELECT COUNT(id) AS count FROM user WHERE id = ?";

        try{
            const results = await connection.query(query, [id]);

            if(results[0][0].count == 0)
                return true;

            return false;
        }catch(error){
            console.error("Database query error from joinSever: ", error);
            return false;
        }finally{
            if(connection)
                await connection.end();
        }
    }

    return false;
}

export async function setUser(userId, userPw, email, nick) {    //240828 테스트 필요!
    const connection = await getConnection();
    const query1 = "INSERT INTO user(id, password, signinType) VALUES (?, ?, ?)";
    const findUserNum = "SELECT num FROM user WHERE id = ? && password = ?"
    const query2 = "INSERT INTO userinfo(num, email, nickname) VALUES (?, ?, ?)";

    try {
        await connection.query(query1, [userId, userPw, 0]);
        let userNum = await connection.query(findUserNum, [userId, userPw]);
        await connection.query(query2, [userNum[0][0].num, email, nick]);
        return { message: "회원가입 성공!", status: 200 };
    } catch (error) {
        console.error("setUser error: ", error); // 구체적인 에러 메시지 출력
        return { message: "DataBase Query Error", status: 500 };
    }finally {
        if (connection) await connection.end();
    }
}

export async function findID(email){ //240828 테스트 필요!
    const connection = await getConnection();
    const query = "SELECT num FROM userinfo WHERE email = ?";
    const userType = "SELECT signinType FROM user WHERE num = ?"
    const find = "SELECT id FROM user WHERE num = ?";

    try {
        const [userNum] = await connection.query(query, [email]);
        const [Type] = await connection.query(userType, [userNum[0].num]);

        if (userNum.length > 0 && Type.length > 0 && Type[0].signinType == 0) {
            const [result] = await connection.query(find, [userNum[0].num]);

            if (result.length > 0) {
                return {message: "당신의 아이디는 " + result[0].id + " 입니다!", status: 200};
            } else {
                return {message: "해당 이메일로 가입된 아이디가 없습니다.", status: 400};
            }
        } else {
            return {message: "해당 이메일로 가입된 아이디가 없습니다.", status: 400};
        }
    } catch (error) {
        console.error("findID error: ", error);
        return { message: "DataBase Query Error", status: 500 };
    } finally {
        if (connection) await connection.end();
    }
}

export async function writeEmailToken(id, email){    //비밀번호 찾기가 아니라 재설정이 가능하도록 만들어야 겠는데?
    const connection = await getConnection();
    const query1 = "SELECT num FROM user WHERE id = ?";
    const query2 = "SELECT email FROM userinfo WHERE email = ?";
    const updatequery = "UPDATE userinfo SET email_token = ? WHERE num = ?"

    try{
        const [userNum] = await connection.query(query1, [id]);
        const [userEmail] = await connection.query(query2, [email]);

        let randombytes = crypto.randomBytes(8);
        let email_token = randombytes.toString('hex')

        await connection.query(updatequery, [email_token, userNum[0].num])
        
        return { email_token : email_token, email : userEmail[0].email, status: 200}
    }catch (error) {
        console.error("findPw error: ", error);
        return { message: "아이디나 이메일을 확인해주세요", status: 400 };
    }finally{
        if(connection) await connection.end();
    }
}

export async function updatePassword(email_token){ //240828 테스트 필요!
    const connection = await getConnection();
    const selectNumQuery = "SELECT num FROM userinfo WHERE email_token = ?"
    const userType = "SELECT signinType FROM user WHERE num = ?";
    const updateTokenQuery = "UPDATE userinfo SET reset_token = ?, reset_token_expiry = ? WHERE num = ?";

    try{
        const [userNum] = await connection.query(selectNumQuery, [email_token])
        if(userNum.length > 0){
            const [Type] = await connection.query(userType, [userNum[0].num]);
            if(Type.length > 0 && Type[0].signinType == 0){
                const token = crypto.randomBytes(32).toString('hex');
                const expiry = new Date(Date.now() + 1200000);  // 20분 유효
        
                await connection.query(updateTokenQuery, [token, expiry, userNum[0].num]);
        
                // 리셋 링크 생성
                const resetLink = `http://localhost:3000/reset-password?token=${token}`;
        
                return { message: resetLink, status: 200 };
            }
            else
                return {message: '비밀번호를 초기화 할 수 없는 계정입니다.', status: 400};
        }  
        else
            return {message: '비밀번호를 초기화 할 수 없는 계정입니다.', status: 400};
        
        
    }catch {
        return {message : '이메일의 토큰과 일치하지 않습니다', status: 400}
    } finally{
        if(connection) await connection.end();
    }
}


export async function resetPassword(token, newPassword) { //240828 테스트 필요!
    const connection = await getConnection();
    const query = "SELECT num, reset_token_expiry FROM userinfo WHERE reset_token = ?";
    const userType = "SELECT signinType FROM user WHERE num = ?";
    const updatePasswordQuery = "UPDATE user SET password = ? WHERE num = ?";
    const clearTokenQuery = "UPDATE userinfo SET reset_token = NULL, reset_token_expiry = NULL WHERE num = ?";

    try {
        const [result] = await connection.query(query, [token]);

        if (result.length === 0 || result[0].reset_token_expiry < new Date()) {
            return { message: "Invalid or expired token", status: 400 };
        }

        const [Type] = await connection.query(userType,[result[0].num]);

        if(Type.length === 0 || Type[0].signinType != 0)
            return { message: "비밀번호가 초기화 불가한 계정입니다.", status: 400 };

        await connection.query(updatePasswordQuery, [newPassword, result[0].num]);
        await connection.query(clearTokenQuery, [result[0].num]);

        return { message: "Password reset successfully", status: 200 };
    } catch (error) {
        console.error("resetPassword error: ", error);
        return { message: "Database Query Error", status: 500 };
    } finally {
        if (connection) await connection.end();
    }
}

export async function findSessionById(id, newSession){
    const connection = await getConnection();
    const sessionId = "SELECT sessionId FROM userinfo WHERE num = (SELECT num FROM user WHERE id = ?)";

    try{
        const [result] = await connection.query(sessionId, [id]);

        if(result.length > 0 && newSession != result[0].sessionId){
            return {message: result[0].sessionId, status:200};
        }else{
            return {message: "null", status:400};
        }
    }catch(error){
        console.error("findSessionById error: ",error);
        return {message: "null", status:400};
    }finally{
        if(connection) connection.end();
    }
}

export async function compareSession(id){
    const connection = await getConnection();
    const compareQuery = "SELECT sessionId FROM userinfo WHERE num = (SELECT num FROM user WHERE id = ?)";

    try{
        const [result] = await connection.query(compareQuery, [id]);
        if(result.length > 0){
            return {message: result[0].sessionId, status:200};
        }else{
            return {message: "null", status:400};
        }
    }catch(err){
        console.error("compareSession error", err);
        return {message: "compareSession 에러", status: 400};
    }finally{
        if(connection) connection.end();
    }
}

export async function updateSessionId(id, newSession) {
    const connection = await getConnection();
    const query = "UPDATE userinfo SET sessionId = ? WHERE num = (SELECT num FROM user WHERE id = ?)";

    try {
        await connection.query(query, [newSession, id]);

        return {message: "Success!", status: 200};
    } catch (error) {
        console.error("saveSessionId error: ", error);
        return { message: "saveSessionId failed", status: 400 };
    } finally {
        if (connection) connection.end();
    }
}

export async function resetSessionId(session){
    const connection = await getConnection();
    const query = "UPDATE userinfo SET sessionId = NULL WHERE sessionId = ?";

    try{
        await connection.query(query, [session]);

        return {message: "deleteSuccess!", status: 200};
    }catch(error){
        console.error("deleteSessionId error: ",error);
        return {message: "deleteSessionId failed", status: 400};
    }finally{
        if(connection) connection.end();
    }
}

export async function getPasswordById(id){
    const connection = await getConnection();
    const query = "SELECT password From user WHERE id = ?";
    try{
        const [result] = await connection.query(query, [id]);

        return {message: result[0].password, status: 200};
    }catch(err){
        return {message: "삭제진행 불가능", status: 400};
    }finally{
        if(connection) connection.end();
    }
}
/**
 * 
 * @param {*} id 
 * 아이디를 삭제하는 함수
 * @returns 
 */
export async function deleteUser(id){
    const connection = await getConnection();
    const findUserNum = "SELECT num FROM userinfo WHERE sessionId = ?"
    const deleteUserInfo = "DELETE FROM userinfo WHERE num = ?";
    const deleteUser = "DELETE FROM user WHERE num = ?";
    try{
        const [userNum] = await connection.query(findUserNum, [cookieSession]);
        await connection.query(deleteUserInfo, [userNum[0].num]);
        await connection.query(deleteUser, [userNum[0].num]);

        return {message: "삭제가 완료되었습니다!", status: 200};
    }catch(err){
        return {message: "삭제에 실패하였습니다.", status: 400};
    }finally{
        if(connection) connection.end();
    }
}

export async function searchRecom(searchText){
    const connection = await getConnection();
    const query = "SELECT * FROM dcmall.productinfo WHERE MATCH(title) AGAINST(? IN NATURAL LANGUAGE MODE);"

    try{
        const [result] = await connection.query(query, [searchText]);
        if (result.length > 0) {
            return { message: result, status: 200 };
        } else {
            return { message: "No results", status: 200 };
        }
    } catch(err) {
        console.error("searchRecom 실패: " + err);
        return { message: "searchRecom 실패 " + err, status: 400 };
    } finally {
        if(connection) connection.end();
    }
}

export async function selectAllProduct(){
    const connection = await getConnection();
    const query = "SELECT title,cost,url FROM dcmall.productinfo";

    try{
        const [result] = await connection.query(query);
        
        if(result.length > 0){
            // const titles = result.map(result => result.title);
            //  // JSON 객체로 변환
            //  const response = { title: titles };

            return {message: result, status: 200 };
        }else{
            return {message: "selectAllProduct Failed", status: 400};
        }
    }catch(err){
        console.error("selectAllProduct 오류: "+err);
        return {message: "selectAllProduct Error", status:400};
    } finally{
        if(connection) connection.end();
    }
}

export async function selectUserByGoogleEmail(email){   //240828 테스트 필요!
    const connection = await getConnection();
    const query = "SELECT nickname FROM userinfo WHERE email = ?";

    try{
        const [result] = await connection.query(query, [email]);

        if(result.length > 0){
            return {nickname: result[0].nickname, status: 200};
        }
        else{
            return {message: "새로운 유저", status: 201};
        }
    }catch(err){
        console.error("selectUserByGoogleEmail 오류: ",err);
        return {message: "selectUserByGoogleEmail Error", status: 400}
    }finally{
        if(connection) connection.end();
    }
}

export async function setUserGoogleLogin(email, nick) {    //240828 테스트 필요!
    const connection = await getConnection();
    const query1 = "INSERT INTO user(id, password, signinType) VALUES (?, ?, ?)";
    const findUserNum = "SELECT num FROM user WHERE id = ? && password = ?"
    const query2 = "INSERT INTO userinfo(num, email, nickname) VALUES (?, ?, ?)";

    try {
        const userId = generateRandomString(10);  // 10자리의 난수 ID 생성
        const userPw = generateRandomString(10);  // 10자리의 난수 PW 생성

        await connection.query(query1, [userId, userPw, 1]);  //여기선 아이디와 비밀번호를 임의로 만들었지만 어찌 할지 추후 결정
        let userNum = await connection.query(findUserNum, [userId, userPw]);
        await connection.query(query2, [userNum[0][0].num, email, nick]);
        return { message: "회원가입 성공!", status: 200 };
    } catch (error) {
        console.error("setUserGoogleLogin error: ", error); // 구체적인 에러 메시지 출력
        return { message: "DataBase Query Error", status: 500 };
    }finally {
        if (connection) await connection.end();
    }
}

export async function selectSessionByGoogleEmail(email){    //240828 테스트 필요!
    const connection = await getConnection();
    const query = "SELECT sessionId FROM userinfo WHERE email = ?";

    try{
        const [result] = await connection.query(query, [email]);

        if(result.length > 0){
            if(result[0].sessionId === null){
                return {message: "세션이 존재하지 않는 구글 이메일!", status: 404};
            }else{
                return {sessionId: result[0].sessionId, status: 200};
            }
        }else{
            return { message: "selectSessionByGoogleEmail error", status: 500 };
        }
    } catch(err){
        console.error("selectSessionByGoogleEmail error: ", err); // 구체적인 에러 메시지 출력
        return { message: "selectSessionByGoogleEmail error", status: 500 };
    }finally{
        if (connection) await connection.end();
    }
}

export async function updateSessionByGoogleEmail(email, newSessionId) {
    const connection = await getConnection();
    try {
      const [result] = await connection.execute(
        "UPDATE dcmall.userinfo SET sessionId = ? WHERE email = ?",
        [newSessionId, email]
      );
      return { message: "sessionId Update Success by Google email", status: 200 };
    } catch (err) {
      console.error("updateSessionByGoogleEmail error: ", err);
      return { message: "updateSessionByGoogleEmail error", status: 500 };
    } finally {
      connection.release();
    }
}

export async function selectUserId(CookieSessionId){
    const connection = await getConnection();
    const SelectUserId = "SELECT num FROM userinfo WHERE sessionId = ?"
    try{
        const [rows] = await connection.query(SelectUserId, [CookieSessionId]);
        console.log(rows);
        return rows.length > 0;
    }catch(err){
        return false;
    }finally{
        if(connection) connection.end();
    }
}

function idStringCheck(id){
    return /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(id);
}

function generateRandomString(length) {
    let result = '';
    const characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    const charactersLength = characters.length;

    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

export async function updateSessionIdEmail(session) {
    const connection = await getConnection();
    const query = "UPDATE userinfo SET sessionId = ? WHERE email = ?";
    const values = [session.provider ,session.user.email]
    console.log("check : " + session.provider + " "+ session.user.email)

    try {
        await connection.query(query, values);

        return {message: "Success!", status: 200};
    } catch (error) {
        console.error("saveSessionId error: ", error);
        return { message: "saveSessionId failed", status: 400 };
    } finally {
        if (connection) connection.end();
    }
}