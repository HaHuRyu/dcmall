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
        const query = "SELECT COUNT(nickname) AS count From userinfo WHERE nickname = ?";0
0
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

export async function setUser(userId, userPw, email, nick) {
    const connection = await getConnection();
    const query1 = "INSERT INTO user(id, password) VALUES (?, ?)";
    const findUserNum = "SELECT num FROM user WHERE id = ? && password = ?"
    const query2 = "INSERT INTO userinfo(num, email, nickname) VALUES (?, ?, ?)";

    try {
        await connection.query(query1, [userId, userPw]);
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

export async function findID(email){
    const connection = await getConnection();
    const query = "SELECT num FROM userinfo WHERE email = ?";
    const find = "SELECT id FROM user WHERE num = ?";

    try {
        const [userNum] = await connection.query(query, [email]);

        if (userNum.length > 0) {
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

export async function findPW(id, email){    //비밀번호 찾기가 아니라 재설정이 가능하도록 만들어야 겠는데?
    const connection = await getConnection();
    const query1 = "SELECT num FROM user WHERE id = ?";
    const query2 = "SELECT email FROM userinfo WHERE num = ?";
    const updateTokenQuery = "UPDATE userinfo SET reset_token = ?, reset_token_expiry = ? WHERE num = ?";

    try{
        const [userNum] = await connection.query(query1, [id]);
        const [userEmail] = await connection.query(query2, [userNum[0].num]);

        if(userEmail[0].email === email){
            const token = crypto.randomBytes(32).toString('hex');
            const expiry = new Date(Date.now() + 1200000);  // 20분 유효

            await connection.query(updateTokenQuery, [token, expiry, userNum[0].num]);

            // 리셋 링크 생성
            const resetLink = `http://localhost:3000/reset-password?token=${token}`;

            return { message: resetLink, status: 200 };
        }else{
            return {message: "아이디나 이메일을 확인해주세요", status: 400};
        }
    }catch (error) {
        console.error("findPw error: ", error);
        return { message: "DataBase Query Error", status: 500 };
    }finally{
        if(connection) await connection.end();
    }
}


export async function resetPassword(token, newPassword) {
    const connection = await getConnection();
    const query = "SELECT num, reset_token_expiry FROM userinfo WHERE reset_token = ?";
    const updatePasswordQuery = "UPDATE user SET password = ? WHERE num = ?";
    const clearTokenQuery = "UPDATE userinfo SET reset_token = NULL, reset_token_expiry = NULL WHERE num = ?";

    try {
        const [result] = await connection.query(query, [token]);

        if (result.length === 0 || result[0].reset_token_expiry < new Date()) {
            return { message: "Invalid or expired token", status: 400 };
        }

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


function idStringCheck(id){
    return /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(id);
}

