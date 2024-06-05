import crypto from 'crypto';
import CryptoJS from 'crypto-js';

// 회원가입 시
export function password_salt(userPw){

    let randombytes = crypto.randomBytes(3);
    let salt = randombytes.toString('hex')

    let pwdSalt = userPw + salt;

    return  CryptoJS.SHA256(pwdSalt).toString() + salt;
}

// 로그인 시 비밀번호 체크
export function password_check(password, userPw){
    let salt = password.slice(-6)
    let pw = password.slice(0, [-6])
    
    let hash_pw = CryptoJS.SHA256(userPw+salt).toString();

    console.log("비밀번호 비교 (DB쪽 비밀번호): ",pw," //(사용자 입력 비밀번호): ",hash_pw);
    
    return pw == hash_pw

}