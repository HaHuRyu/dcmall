// lib/db.js
/*
왜 mysql2/promise를 사용해야 하는가?
프로미스 기반 API: 비동기 작업을 더 쉽게 관리하고, async/await 구문을 사용하여 비동기 코드의 가독성을 높일 수 있습니다.
콜백 기반 API: 더 복잡한 콜백 헬(callback hell)을 피하기 어려울 수 있습니다.
*/
import mysql from 'mysql2/promise';
import crypto from 'crypto';

let connection;

export async function getConnection() {
    try{
        connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        });
        console.log('MySQL 데이터베이스에 연결되었습니다. 연결 ID:', connection.threadId);
        return connection;
    } catch(error){
        console.error('MySQL 연결 오류:', error);
        throw error;
    }
    
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
        console.error("writeEmailToken error: ", error);
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
                const resetLink = `https://localhost:3001/login/reset-password?token=${token}`;
        
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

export async function updateSessionId(id, newSession, maxTime) {
    const connection = await getConnection();
    const query = "UPDATE userinfo SET sessionId = ?, session_expire_time = ? WHERE num = (SELECT num FROM user WHERE id = ?)";

    try {
        await connection.query(query, [newSession, maxTime, id]);

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
    const query = "UPDATE userinfo SET sessionId = NULL, session_expire_time = NULL WHERE sessionId = ?";

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
    const query = `
    SELECT 
        dcmall.productinfo.postid AS id,
        dcmall.productinfo.imageUrl AS imageUrl,
        dcmall.productinfo.title AS title, 
        dcmall.productinfo.cost AS cost, 
        CONCAT(dcmall.site.url, dcmall.productinfo.url) AS perfectUrl 
    FROM 
        dcmall.productinfo 
    LEFT OUTER JOIN 
        dcmall.site ON dcmall.productinfo.id = dcmall.site.id
    ORDER BY
        id DESC;`;

    try {
        const [productsWithSiteUrl] = await connection.query(query);

        if (productsWithSiteUrl.length > 0) {
            return { message: productsWithSiteUrl, status: 200 };
        } else {
            return { message: "selectAllProduct Failed", status: 400 };
        }
    } catch (err) {
        console.error("selectAllProduct 오류: " + err);
        return { message: "selectAllProduct Error", status: 400 };
    } finally {
        if (connection) await connection.end();
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

export async function updateSessionByGoogleEmail(email, newSessionId, maxTime){    //240828 테스트 필요!
    const connection = await getConnection();
    const query = "UPDATE dcmall.userinfo SET sessionId = ?, session_expire_time = ? WHERE email = ?";

    try{
        await connection.query(query, [newSessionId, maxTime, email]);

        return {message: "sessionId Update Success by Google email", status : 200};
    }catch(err){
        console.error("updateSessionByGoogleEmail error: ",err);
        return { message: "updateSessionByGoogleEmail error", status: 500 };
    }finally{
        if (connection) await connection.end();
    }
}

export async function selectUserId(CookieSessionId){
    const connection = await getConnection();
    const SelectUserId = "SELECT num FROM userinfo WHERE sessionId = ?"
    try{
        const [rows] = await connection.query(SelectUserId, [CookieSessionId]);
        console.log(rows[0].num);

        return rows[0].num
    }catch(err){
        return 0;
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

export async function searchLinking(searchTexts) {
    let connection;
    try {
        connection = await getConnection();
        
        if (!Array.isArray(searchTexts) || searchTexts.length === 0) {
            throw new Error("Invalid searchTexts: must be a non-empty array");
        }

        const titles = searchTexts.map(item => item.title);

        // 동적으로 OR 조건 생성
        const conditions = titles.map(() => 'dcmall.productinfo.title = ?').join(' OR ');
        const query = `
        SELECT
            dcmall.productinfo.imageUrl AS imageUrl,
            dcmall.productinfo.title AS title,
            dcmall.productinfo.cost AS cost,
            CONCAT(dcmall.site.url, dcmall.productinfo.url) AS perfectUrl
        FROM 
            dcmall.productinfo
            LEFT OUTER JOIN dcmall.site ON dcmall.productinfo.id = dcmall.site.id
        WHERE
            ${conditions};
        `;

        const [productsWithSiteUrl] = await connection.query(query, titles);

        if (productsWithSiteUrl.length === 0) {
            return { message: "No matching products found", status: 404 };
        }

        // 결과에 similarity 추가
        const resultsWithSimilarity = productsWithSiteUrl.map(product => {
            const searchItem = searchTexts.find(item => item.title === product.title);
            return {
                ...product,
                similarity: searchItem ? searchItem.similarity : null
            };
        });

        // similarity를 기준으로 내림차순 정렬
        resultsWithSimilarity.sort((a, b) => b.similarity - a.similarity);

        return { message: resultsWithSimilarity, status: 200 };
    } catch (err) {
        console.error("searchLinking 실패:", err);
        return { message: `searchLinking 실패: ${err.message}`, status: 400 };
    } finally {
        if (connection) await connection.end();
    }
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


export async function updateSessionInDB(email, sessionToken) {
    const connection = await getConnection();
    const query = "UPDATE userinfo SET sessionId = ? WHERE email = ?";
    console.log("sessionToken : " + sessionToken)
    console.log("email : " + email)
  
    try {
      await connection.query(query, [sessionToken, email]);
      console.log("Session updated in DB for email:",email);
    } catch (error) {
      console.error("Error updating session in DB:", error);
      throw error;
    } finally {
      if (connection) await connection.end();
    }
}

export async function saveToken(token, num) {
    const connection = await getConnection();
    const query = "INSERT INTO discord (num, checkword) VALUES (?, ?) ON DUPLICATE KEY UPDATE checkword = VALUES(checkword)";
    try {
        await connection.query(query, [num, token]);
        console.log("Token saved in DB:", token);
    } catch (error) {
        console.error("Error saving token in DB:", error);
    } finally {
        if (connection) connection.end();
    }
}

export async function selectSignInMethod(sessionId){
    const connection = await getConnection();
    const query = "SELECT signinType FROM dcmall.user WHERE num = (SELECT num FROM dcmall.userinfo WHERE sessionId = ?)"

    try{
        const [result] = await connection.query(query, [sessionId]);    //왜 결과가 안 나오지?
        return result[0].signinType;
    }catch(err){
        console.error("selectSignInMethod error: ", err);
        return null;
    }finally{
        if(connection) connection.end();
    }
}

export async function selectuserinfoByNum(num){
    const connection = await getConnection();
    const query = "SELECT * FROM dcmall.userinfo WHERE num = ?";
    try{
        const [result] = await connection.query(query, [num]);
        console.log("selectuserinfoByNum result:", result[0]); // 로그 추가
        return result[0];
    }catch(err){
        console.error("selectuserinfoByNum error: ", err);
        return null;
    }finally{
        if(connection) connection.end();
    }
}

export async function deleteCustomUser(num){
    const connection = await getConnection();
    const userQuery = "DELETE FROM dcmall.user WHERE num = ?";
    const userinfoQuery = "DELETE FROM dcmall.userinfo WHERE num = ?";
    try{
        await connection.query(userQuery, [num]);
        await connection.query(userinfoQuery, [num]);
        return {message: "회원탈퇴 성공", status: 200};
    }catch(err){
        console.error("deleteCustomUser error: ", err);
        return {message: "회원탈퇴 실패", status: 400};
    }finally{
        if(connection) connection.end();
    }
}

export async function deleteGoogleUser(email){
    const connection = await getConnection();
    const numQuery = "SELECT num FROM dcmall.userinfo WHERE email = ?";
    const userQuery = "DELETE FROM dcmall.user WHERE num = ?";
    const userinfoQuery = "DELETE FROM dcmall.userinfo WHERE num = ?";
    try{
        const [result] = await connection.query(numQuery, [email]);
        const num = result[0].num;
        await connection.query(userQuery, [num]);
        await connection.query(userinfoQuery, [num]);
        return {message: "구글 회원탈퇴 성공", status: 200};
    }catch(err){
        console.error("deleteGoogleUser error: ", err);
        return {message: "구글 회원탈퇴 실패", status: 400};
    }finally{
        if(connection) connection.end();
    }

}

export async function checkPasswordBySessionId(sessionId){
    const connection = await getConnection();
    const query = "SELECT * FROM user WHERE num = (SELECT num FROM userinfo WHERE sessionId = ?)";
    try{
        const [result] = await connection.query(query, [sessionId]);
        return result[0];
    }catch(err){
        console.error("checkPasswordBySessionId error: ", err);
        return null;
    }finally{
        if(connection) connection.end();
    }
}

export async function mypageResetPassword(num, newPw){
    const connection = await getConnection();
    const query = "UPDATE user SET password = ? WHERE num = ?";
    try{
        await connection.query(query, [newPw, num]);
        return {message: "비밀번호 변경 성공", status: 200};
    }catch(err){
        console.error("mypageResetPassword error: ", err);
        return {message: "비밀번호 변경 실패", status: 400};
    }finally{
        if(connection) connection.end();
    }
}

export async function updateEmail(email_token, oldEmail, newEmail){
    const connection = await getConnection();
    const checkQuery = "SELECT email FROM userinfo WHERE email_token = ?"
    const updateQuery = "UPDATE userinfo SET email = ? WHERE email = ?"
    try{
        const [result] = await connection.query(checkQuery, [email_token]);
        if(result.length === 0) {
            return {message: "유효하지 않은 이메일 토큰입니다.", status: 400};
        }
        if(result[0].email == oldEmail){
            await connection.query(updateQuery, [newEmail, oldEmail]);
            return {message: "이메일 변경 성공", status: 200};
        } else {
            return {message: "이메일 정보가 일치하지 않습니다.", status: 400};
        }
    }catch(err){
        console.error("updateEmail error: ", err);
        return {message: "이메일 변경 실패", status: 500};
    }finally{
        if(connection) connection.end();
    }
}

export async function selectCustomUser(id){
    const connection = await getConnection();
    const query = "SELECT * FROM userinfo WHERE num = (SELECT num FROM user WHERE id = ?)";

    try{
        const [result] = await connection.query(query, [id]);

        if(result.length > 0){
            return {message: '유저 찾음', user: result[0], status: 200};
        }else{
            return {message: '유저 못 찾음', status: 201};
        }
    }catch(err){
        console.error("selectCustomUser error: ",err);
        return {message: "selectCustomUser error", status: 500};
    }finally{
        if(connection) connection.end();
    }
}

export async function selectSessionExpireTimeBySession(sessionId){
    const connection = await getConnection();
    const query = "SELECT session_expire_time FROM userinfo WHERE sessionId = ?"

    try{
        const [result] = await connection.query(query, [sessionId]);

        if(result.length > 0){
            return {message: result[0].session_expire_time, status: 200};
        }else{
            return {message: null, statsu: 201};
        }
    }catch(err){
        console.error("selectSessionExpireTimeBySession error: ",err);
        return {message: "selectSessionExpireTimeBySession error", status: 500};
    }finally{
        if(connection) connection.end();
    }
}

export async function updateSessionExpireTimeBySession(sessionId, Time){
    const connection = await getConnection();
    const query = "UPDATE userinfo SET session_expire_time = ? WHERE sessionId = ?"

    try{
        console.log("성공했는가?");
        await connection.query(query, [Time, sessionId]);
        return {message: "세션 업데이트 성공", status: 200};
    }catch(err){
        console.error("updateSessionExpireTimeBySession error: ",err);
        return {message: "세션 업데이트 실패", status: 500};
    }finally{
        if(connection) connection.end();
    }
}
export async function certificationNotification(num) {
    const connection = await getConnection();
    const query = "SELECT user_num FROM notification WHERE user_num = ?";
    try {
        const [result] = await connection.query(query, [num]);
        return result.length > 0;
    } catch (error) {
        console.error("Error certification discord:", error);
        return false;
    } finally {
        if (connection) connection.end();
    }
}
