// lib/db.js

import mysql from 'mysql2/promise';
import crypto from 'crypto';

/** 
 * 1) 커넥션 풀 생성
 *    - 필요 연결을 미리(또는 동적으로) 만들어 두고, 여러 요청이 있을 때 풀에서 연결을 빌려와 사용
 *    - 작업이 끝나면 자동으로 연결을 풀에 반환
 */
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  port: process.env.DB_PORT,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  waitForConnections: true,  // 풀 내 모든 연결이 사용 중이면 대기
  connectionLimit: 10,       // 최대 연결 개수
  queueLimit: 0              // 대기열 제한 (0이면 무제한)
});

/** 
 * 2) 더 이상 getConnection으로 개별 연결을 만들 필요가 없으므로,
 *    아래 함수는 직접 풀에 접근하도록 변경하거나, 필요하면 삭제해도 무방합니다.
 *    여기서는 pool을 직접 반환하는 식으로 구현.
 */
export async function getConnection() {
  // 필요 시 pool.getConnection()을 통해 수동으로 커넥션 객체를 빌릴 수도 있음
  // 그러나 단순 쿼리는 pool.query(...)를 바로 써도 됩니다.
  return pool;
}

/** 
 * 아래부터는 모든 함수에서
 * "const [rows] = await pool.query(...)"
 * 로직을 통해 쿼리를 실행하고,
 * 더 이상 connection.end()를 호출하지 않습니다.
 */

/** [ 예시 함수 ] */
export async function queryDatabase(id) {
  const query = "SELECT * FROM user WHERE id = ?";

  try {
    // pool.query()를 통해 바로 쿼리 실행
    const [rows, fields] = await pool.query(query, [id]);
    console.log("쿼리 출력: "+JSON.stringify(rows[0]));
    return rows;
  } catch (error) {
    console.error("Error executing query:", error);
    return false;
  }
}

/** ID 체크 */
export async function idCheck(id) {
  const hasHangul = idStringCheck(id);

  if (id !== null && !id.includes(" ") && id.length <= 50 && !hasHangul) {
    const query = "SELECT COUNT(id) AS count FROM user WHERE id = ?";
    try {
      const [results] = await pool.query(query, [id]);
      if (results[0].count == 0) {
        return { message: "사용할 수 있는 ID", status: 200 };
      }
      return { message: "이미 존재하는 ID", status: 200 };
    } catch (error) {
      console.log("idCheck error: " + error);
      return { message: "Database query error", status: 500 };
    }
  }
  return { message: "다른 ID를 사용해주십시오.", status: 400 };
}

/** 닉네임 체크 */
export async function nickCheck(nick) {
  if (nick !== null && !nick.includes(" ") && nick.length <= 20) {
    const query = "SELECT COUNT(nickname) AS count From userinfo WHERE nickname = ?";
    try {
      const [results] = await pool.query(query, [nick]);
      if (results[0].count == 0) {
        return { message: "사용할 수 있는 닉네임", status: 200 };
      }
      return { message: "이미 존재하는 닉네임", status: 200 };
    } catch (error) {
      console.log("nickCheck error: " + error);
      return { message: "Database query error", status: 500 };
    }
  }
  return { message: "다른 닉네임을 사용해주십시오.", status: 400 };
}

/** 최종 ID 확인 */
export async function finalIdCheck(id) {
  const hasHangul = idStringCheck(id);
  if (id !== null && !id.includes(" ") && id.length <= 50 && !hasHangul) {
    const query = "SELECT COUNT(id) AS count FROM user WHERE id = ?";
    try {
      const [results] = await pool.query(query, [id]);
      return results[0].count == 0;
    } catch (error) {
      console.error("Database query error from joinSever: ", error);
      return false;
    }
  }
  return false;
}

/** 회원가입 */
export async function setUser(userId, userPw, email, nick, salt) {
  const query1 = "INSERT INTO user(id, password, signinType, salt) VALUES (?, ?, ?, ?)";
  const findUserNum = "SELECT num FROM user WHERE id = ? && password = ?";
  const query2 = "INSERT INTO userinfo(num, email, nickname) VALUES (?, ?, ?)";
  try {
    await pool.query(query1, [userId, userPw, 0, salt]);
    let [userNum] = await pool.query(findUserNum, [userId, userPw]);
    await pool.query(query2, [userNum[0].num, email, nick]);
    return { message: "회원가입 성공!", status: 200 };
  } catch (error) {
    console.error("setUser error: ", error);
    return { message: "DataBase Query Error", status: 500 };
  }
}

/** ID 찾기 */
export async function findID(email) {
  const query = "SELECT num FROM userinfo WHERE email = ?";
  const userType = "SELECT signinType FROM user WHERE num = ?";
  const find = "SELECT id FROM user WHERE num = ?";
  try {
    const [userNum] = await pool.query(query, [email]);
    if (userNum.length === 0) {
      return { message: "해당 이메일로 가입된 아이디가 없습니다.", status: 400 };
    }

    const [Type] = await pool.query(userType, [userNum[0].num]);
    if (Type.length > 0 && Type[0].signinType == 0) {
      const [result] = await pool.query(find, [userNum[0].num]);
      if (result.length > 0) {
        return { message: "당신의 아이디는 " + result[0].id + " 입니다!", status: 200 };
      } else {
        return { message: "해당 이메일로 가입된 아이디가 없습니다.", status: 400 };
      }
    } else {
      return { message: "해당 이메일로 가입된 아이디가 없습니다.", status: 400 };
    }
  } catch (error) {
    console.error("findID error: ", error);
    return { message: "DataBase Query Error", status: 500 };
  }
}

/** 이메일 토큰 작성 */
export async function writeEmailToken(id, email) {
  const query1 = "SELECT num FROM user WHERE id = ?";
  const query2 = "SELECT email FROM userinfo WHERE email = ?";
  const updatequery = "UPDATE userinfo SET email_token = ? WHERE num = ?";
  try {
    const [userNum] = await pool.query(query1, [id]);
    const [userEmail] = await pool.query(query2, [email]);
    let randombytes = crypto.randomBytes(8);
    let email_token = randombytes.toString('hex');

    await pool.query(updatequery, [email_token, userNum[0].num]);
    return { email_token: email_token, email: userEmail[0].email, status: 200 };
  } catch (error) {
    console.error("writeEmailToken error: ", error);
    return { message: "아이디나 이메일을 확인해주세요", status: 400 };
  }
}

/** 비밀번호 재설정 토큰 발급 */
export async function updatePassword(email_token) {
    console.log(email_token)
  const selectNumQuery = "SELECT num FROM userinfo WHERE email_token = ?";
  const userType = "SELECT signinType FROM user WHERE num = ?";
  const updateTokenQuery = "UPDATE userinfo SET reset_token = ?, reset_token_expiry = ? WHERE num = ?";
  try {
    const [userNum] = await pool.query(selectNumQuery, [email_token]);
    if (userNum.length > 0) {
      const [Type] = await pool.query(userType, [userNum[0].num]);
      if (Type.length > 0 && Type[0].signinType == 0) {
        const token = crypto.randomBytes(32).toString('hex');
        const expiry = new Date(Date.now() + 1200000); // 20분 유효
        await pool.query(updateTokenQuery, [token, expiry, userNum[0].num]);
        const resetLink = `https://localhost:3001/login/reset-password?token=${token}`;
        return { message: resetLink, status: 200 };
      } else {
        return { message: '비밀번호를 초기화 할 수 없는 계정입니다.dddd', status: 400 };
      }
    } else {
      return { message: '비밀번호를 초기화 할 수 없는 계정입니다.ddd', status: 400 };
    }
  } catch {
    return { message: '이메일의 토큰과 일치하지 않습니다', status: 400 };
  }
}

/** 실제 비밀번호 재설정 */
export async function resetPassword(token, newPassword, newSalt) {
  const query = "SELECT num, reset_token_expiry FROM userinfo WHERE reset_token = ?";
  const userType = "SELECT signinType FROM user WHERE num = ?";
  const updatePasswordQuery = "UPDATE user SET password = ?, salt = ? WHERE num = ?";
  const clearTokenQuery = "UPDATE userinfo SET reset_token = NULL, reset_token_expiry = NULL WHERE num = ?";
  try {
    const [result] = await pool.query(query, [token]);
    if (result.length === 0 || result[0].reset_token_expiry < new Date()) {
      return { message: "Invalid or expired token", status: 400 };
    }
    const [Type] = await pool.query(userType, [result[0].num]);
    if (Type.length === 0 || Type[0].signinType != 0) {
      return { message: "비밀번호가 초기화 불가한 계정입니다.", status: 400 };
    }

    await pool.query(updatePasswordQuery, [newPassword, newSalt, result[0].num]);
    await pool.query(clearTokenQuery, [result[0].num]);
    return { message: "Password reset successfully", status: 200 };
  } catch (error) {
    console.error("resetPassword error: ", error);
    return { message: "Database Query Error", status: 500 };
  }
}

/** 세션 아이디 찾기 */
export async function findSessionById(id, newSession) {
  const sessionId = "SELECT sessionId FROM userinfo WHERE num = (SELECT num FROM user WHERE id = ?)";
  try {
    const [result] = await pool.query(sessionId, [id]);
    if (result.length > 0 && newSession != result[0].sessionId) {
      return { message: result[0].sessionId, status: 200 };
    } else {
      return { message: "null", status: 400 };
    }
  } catch (error) {
    console.error("findSessionById error: ", error);
    return { message: "null", status: 400 };
  }
}

/** 세션 비교 */
export async function compareSession(id) {
  const compareQuery = "SELECT sessionId FROM userinfo WHERE num = (SELECT num FROM user WHERE id = ?)";
  try {
    const [result] = await pool.query(compareQuery, [id]);
    if (result.length > 0) {
      return { message: result[0].sessionId, status: 200 };
    } else {
      return { message: "null", status: 400 };
    }
  } catch (err) {
    console.error("compareSession error", err);
    return { message: "compareSession 에러", status: 400 };
  }
}

/** 세션 ID 업데이트 */
export async function updateSessionId(id, newSession, maxTime) {
  const query = "UPDATE userinfo SET sessionId = ?, session_expire_time = ? WHERE num = (SELECT num FROM user WHERE id = ?)";
  try {
    await pool.query(query, [newSession, maxTime, id]);
    return { message: "Success!", status: 200 };
  } catch (error) {
    console.error("saveSessionId error: ", error);
    return { message: "saveSessionId failed", status: 400 };
  }
}

/** 세션 리셋 */
export async function resetSessionId(session) {
  const query = "UPDATE userinfo SET sessionId = NULL, session_expire_time = NULL WHERE sessionId = ?";
  try {
    await pool.query(query, [session]);
    return { message: "deleteSuccess!", status: 200 };
  } catch (error) {
    console.error("deleteSessionId error: ", error);
    return { message: "deleteSessionId failed", status: 400 };
  }
}

/** ID로부터 비밀번호 가져오기 */
export async function getPasswordById(id) {
  const query = "SELECT password From user WHERE id = ?";
  try {
    const [result] = await pool.query(query, [id]);
    return { message: result[0].password, status: 200 };
  } catch (err) {
    return { message: "삭제진행 불가능", status: 400 };
  }
}

/** 유저 삭제 (예시) */
export async function deleteUser(id) {
  // 주의: cookieSession 변수가 정의되어 있지 않음 (코드 상 오류 가능)
  // 여기선 원본 코드를 그대로 유지했지만, 실제로는 수정이 필요합니다.
  const findUserNum = "SELECT num FROM userinfo WHERE sessionId = ?";
  const deleteUserInfo = "DELETE FROM userinfo WHERE num = ?";
  const deleteUser = "DELETE FROM user WHERE num = ?";
  try {
    const [userNum] = await pool.query(findUserNum, [cookieSession]);
    await pool.query(deleteUserInfo, [userNum[0].num]);
    await pool.query(deleteUser, [userNum[0].num]);
    return { message: "삭제가 완료되었습니다!", status: 200 };
  } catch (err) {
    return { message: "삭제에 실패하였습니다.", status: 400 };
  }
}

/** 검색 자동완성 */
export async function searchRecom(searchText) {
  const query = "SELECT * FROM dcmall.productinfo WHERE MATCH(title) AGAINST(? IN NATURAL LANGUAGE MODE);";
  try {
    const [result] = await pool.query(query, [searchText]);
    if (result.length > 0) {
      return { message: result, status: 200 };
    } else {
      return { message: "No results", status: 200 };
    }
  } catch (err) {
    console.error("searchRecom 실패: " + err);
    return { message: "searchRecom 실패 " + err, status: 400 };
  }
}

/** 전체 상품 조회 */
export async function selectAllProduct(boarder) {
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
        id DESC;
  `;
  try {
    const [productsWithSiteUrl] = await pool.query(query);
    const returnList = productsWithSiteUrl.filter(item => item.id < boarder);
    return { message: returnList, status: 200 };
  } catch (err) {
    console.error("selectAllProduct 오류: " + err);
    return { message: "selectAllProduct Error", status: 400 };
  }
}

/** 구글 이메일로 유저 조회 */
export async function selectUserByGoogleEmail(email) {
  const query = "SELECT nickname FROM userinfo WHERE email = ?";
  try {
    const [result] = await pool.query(query, [email]);
    if (result.length > 0) {
      return { nickname: result[0].nickname, status: 200 };
    } else {
      return { message: "새로운 유저", status: 201 };
    }
  } catch (err) {
    console.error("selectUserByGoogleEmail 오류: ", err);
    return { message: "selectUserByGoogleEmail Error", status: 400 };
  }
}

/** 구글 로그인 회원가입 */
export async function setUserGoogleLogin(email, nick) {
  const query1 = "INSERT INTO user(id, password, signinType) VALUES (?, ?, ?)";
  const findUserNum = "SELECT num FROM user WHERE id = ? && password = ?";
  const query2 = "INSERT INTO userinfo(num, email, nickname) VALUES (?, ?, ?)";
  try {
    const userId = generateRandomString(10);
    const userPw = generateRandomString(10);
    await pool.query(query1, [userId, userPw, 1]);
    let [userNum] = await pool.query(findUserNum, [userId, userPw]);
    await pool.query(query2, [userNum[0].num, email, nick]);
    return { message: "회원가입 성공!", status: 200 };
  } catch (error) {
    console.error("setUserGoogleLogin error: ", error);
    return { message: "DataBase Query Error", status: 500 };
  }
}

/** 구글 이메일로 세션 조회 */
export async function selectSessionByGoogleEmail(email) {
  const query = "SELECT sessionId FROM userinfo WHERE email = ?";
  try {
    const [result] = await pool.query(query, [email]);
    if (result.length > 0) {
      if (result[0].sessionId === null) {
        return { message: "세션이 존재하지 않는 구글 이메일!", status: 404 };
      } else {
        return { sessionId: result[0].sessionId, status: 200 };
      }
    } else {
      return { message: "selectSessionByGoogleEmail error", status: 500 };
    }
  } catch (err) {
    console.error("selectSessionByGoogleEmail error: ", err);
    return { message: "selectSessionByGoogleEmail error", status: 500 };
  }
}

/** 구글 이메일로 세션 업데이트 */
export async function updateSessionByGoogleEmail(email, newSessionId, maxTime) {
  const query = "UPDATE dcmall.userinfo SET sessionId = ?, session_expire_time = ? WHERE email = ?";
  try {
    await pool.query(query, [newSessionId, maxTime, email]);
    return { message: "sessionId Update Success by Google email", status: 200 };
  } catch (err) {
    console.error("updateSessionByGoogleEmail error: ", err);
    return { message: "updateSessionByGoogleEmail error", status: 500 };
  }
}

/** 쿠키 세션으로부터 사용자 num 가져오기 */
export async function selectUserId(CookieSessionId) {
  const SelectUserId = "SELECT num FROM userinfo WHERE sessionId = ?";
  try {
    const [rows] = await pool.query(SelectUserId, [CookieSessionId]);
    console.log(rows[0].num);
    return rows[0].num;
  } catch (err) {
    return 0;
  }
}

/** 문자열에 한글이 포함되어 있는지 검사 */
function idStringCheck(id) {
  return /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(id);
}

/** 랜덤 문자열 생성 */
function generateRandomString(length) {
  let result = '';
  const characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

/** 검색 리킹 */
export async function searchLinking(searchTexts) {
  try {
    if (!Array.isArray(searchTexts) || searchTexts.length === 0) {
      throw new Error("Invalid searchTexts: must be a non-empty array");
    }
    const titles = searchTexts.map(item => item.title);
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
    const [productsWithSiteUrl] = await pool.query(query, titles);
    if (productsWithSiteUrl.length === 0) {
      return { message: "No matching products found", status: 404 };
    }
    const resultsWithSimilarity = productsWithSiteUrl.map(product => {
      const searchItem = searchTexts.find(item => item.title === product.title);
      return {
        ...product,
        similarity: searchItem ? searchItem.similarity : null
      };
    });
    resultsWithSimilarity.sort((a, b) => b.similarity - a.similarity);
    return { message: resultsWithSimilarity, status: 200 };
  } catch (err) {
    console.error("searchLinking 실패:", err);
    return { message: `searchLinking 실패: ${err.message}`, status: 400 };
  }
}

/** 세션 업데이트 (기타 예시) */
export async function updateSessionIdEmail(session) {
  const query = "UPDATE userinfo SET sessionId = ? WHERE email = ?";
  const values = [session.provider, session.user.email];
  console.log("check : " + session.provider + " " + session.user.email);
  try {
    await pool.query(query, values);
    return { message: "Success!", status: 200 };
  } catch (error) {
    console.error("saveSessionId error: ", error);
    return { message: "saveSessionId failed", status: 400 };
  }
}

/** 세션 갱신 */
export async function updateSessionInDB(email, sessionToken) {
  const query = "UPDATE userinfo SET sessionId = ? WHERE email = ?";
  console.log("sessionToken : " + sessionToken);
  console.log("email : " + email);
  try {
    await pool.query(query, [sessionToken, email]);
    console.log("Session updated in DB for email:", email);
  } catch (error) {
    console.error("Error updating session in DB:", error);
    throw error;
  }
}

/** 토큰 저장 */
export async function saveToken(token, num) {
  const query = "INSERT INTO discord (num, checkword) VALUES (?, ?) ON DUPLICATE KEY UPDATE checkword = VALUES(checkword)";
  try {
    await pool.query(query, [num, token]);
    console.log("Token saved in DB:", token);
  } catch (error) {
    console.error("Error saving token in DB:", error);
  }
}

/** signinType 조회 */
export async function selectSignInMethod(sessionId) {
  const query = "SELECT signinType FROM dcmall.user WHERE num = (SELECT num FROM dcmall.userinfo WHERE sessionId = ?)";
  try {
    const [result] = await pool.query(query, [sessionId]);
    return result.length > 0 ? result[0].signinType : null;
  } catch (err) {
    console.error("selectSignInMethod error: ", err);
    return null;
  }
}

/** userinfo By num */
export async function selectuserinfoByNum(num) {
  const query = "SELECT * FROM dcmall.userinfo WHERE num = ?";
  try {
    const [result] = await pool.query(query, [num]);
    console.log("selectuserinfoByNum result:", result[0]);
    return result[0];
  } catch (err) {
    console.error("selectuserinfoByNum error: ", err);
    return null;
  }
}

/** 커스텀 유저 삭제 */
export async function deleteCustomUser(num) {
  const userQuery = "DELETE FROM dcmall.user WHERE num = ?";
  const userinfoQuery = "DELETE FROM dcmall.userinfo WHERE num = ?";
  try {
    await pool.query(userQuery, [num]);
    await pool.query(userinfoQuery, [num]);
    return { message: "회원탈퇴 성공", status: 200 };
  } catch (err) {
    console.error("deleteCustomUser error: ", err);
    return { message: "회원탈퇴 실패", status: 400 };
  }
}

/** 구글 유저 삭제 */
export async function deleteGoogleUser(email) {
  const numQuery = "SELECT num FROM dcmall.userinfo WHERE email = ?";
  const userQuery = "DELETE FROM dcmall.user WHERE num = ?";
  const userinfoQuery = "DELETE FROM dcmall.userinfo WHERE num = ?";
  try {
    const [result] = await pool.query(numQuery, [email]);
    const num = result[0].num;
    await pool.query(userQuery, [num]);
    await pool.query(userinfoQuery, [num]);
    return { message: "구글 회원탈퇴 성공", status: 200 };
  } catch (err) {
    console.error("deleteGoogleUser error: ", err);
    return { message: "구글 회원탈퇴 실패", status: 400 };
  }
}

/** 세션 ID로 비밀번호 확인 */
export async function checkPasswordBySessionId(sessionId) {
  const query = "SELECT * FROM user WHERE num = (SELECT num FROM userinfo WHERE sessionId = ?)";
  try {
    const [result] = await pool.query(query, [sessionId]);
    return result[0];
  } catch (err) {
    console.error("checkPasswordBySessionId error: ", err);
    return null;
  }
}

/** 마이페이지 비밀번호 변경 */
export async function mypageResetPassword(num, newPw, newSalt) {
  const query = "UPDATE user SET password = ?, salt = ? WHERE num = ?";
  try {
    await pool.query(query, [newPw, newSalt, num]);
    return { message: "비밀번호 변경 성공", status: 200 };
  } catch (err) {
    console.error("mypageResetPassword error: ", err);
    return { message: "비밀번호 변경 실패", status: 400 };
  }
}

/** 이메일 업데이트 */
export async function updateEmail(email_token, oldEmail, newEmail) {
  const checkQuery = "SELECT email FROM userinfo WHERE email_token = ?";
  const updateQuery = "UPDATE userinfo SET email = ? WHERE email = ?";
  try {
    const [result] = await pool.query(checkQuery, [email_token]);
    if (result.length === 0) {
      return { message: "유효하지 않은 이메일 토큰입니다.", status: 400 };
    }
    if (result[0].email == oldEmail) {
      await pool.query(updateQuery, [newEmail, oldEmail]);
      return { message: "이메일 변경 성공", status: 200 };
    } else {
      return { message: "이메일 정보가 일치하지 않습니다.", status: 400 };
    }
  } catch (err) {
    console.error("updateEmail error: ", err);
    return { message: "이메일 변경 실패", status: 500 };
  }
}

/** Custom User 조회 */
export async function selectCustomUser(id) {
  const query = "SELECT * FROM userinfo WHERE num = (SELECT num FROM user WHERE id = ?)";
  try {
    const [result] = await pool.query(query, [id]);
    if (result.length > 0) {
      return { message: '유저 찾음', user: result[0], status: 200 };
    } else {
      return { message: '유저 못 찾음', status: 201 };
    }
  } catch (err) {
    console.error("selectCustomUser error: ", err);
    return { message: "selectCustomUser error", status: 500 };
  }
}

/** 세션 유효시간 조회 */
export async function selectSessionExpireTimeBySession(sessionId) {
  const query = "SELECT session_expire_time FROM userinfo WHERE sessionId = ?";
  try {
    const [result] = await pool.query(query, [sessionId]);
    if (result.length > 0) {
      return { message: result[0].session_expire_time, status: 200 };
    } else {
      return { message: null, status: 201 };
    }
  } catch (err) {
    console.error("selectSessionExpireTimeBySession error: ", err);
    return { message: "selectSessionExpireTimeBySession error", status: 500 };
  }
}

/** productinfo 최대 postid */
export async function productinfoMaxPostId() {
  const query = "SELECT postid FROM productinfo ORDER BY postid DESC LIMIT 1";
  try {
    const [result] = await pool.query(query);
    if (result.length > 0) {
      return { message: result[0].postid, status: 200 };
    } else {
      return { message: "제일 윗 번호의 postid를 가져올 수 없음", status: 201 };
    }
  } catch (error) {
    console.error("productinfoMaxPostId error: ", error);
    return { message: "productinfoMaxPostId catch 에러", status: 500 };
  }
}

/** 세션 만료시간 업데이트 */
export async function updateSessionExpireTimeBySession(sessionId, Time, newSession) {
  const query = "UPDATE userinfo SET session_expire_time = ?, sessionId = ? WHERE sessionId = ?";
  try {
    await pool.query(query, [Time, newSession, sessionId]);
    return { message: "세션 업데이트 성공", status: 200 };
  } catch (err) {
    console.error("updateSessionExpireTimeBySession error: ", err);
    return { message: "세션 업데이트 실패", status: 500 };
  }
}

/** 디스코드 인증 */
export async function certificationNotification(num) {
  const query = "SELECT user_num FROM notification WHERE user_num = ?";
  try {
    const [result] = await pool.query(query, [num]);
    return result.length > 0;
  } catch (error) {
    console.error("Error certification discord:", error);
    return false;
  }
}
