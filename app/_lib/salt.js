import crypto from 'crypto';
import CryptoJS from 'crypto-js';

const pepper = process.env.PEPPER;

// 회원가입 시
export function password_salt(userPw){

    let randombytes = crypto.randomBytes(3);
    let salt = randombytes.toString('hex')

    let hashPw = CryptoJS.SHA256(userPw + salt + pepper).toString();
    
    return {hashPw, salt};
}

// 로그인 시 비밀번호 체크
export function password_check(password, userPw, salt){
    
    let hash_pw = CryptoJS.SHA256(userPw+salt+pepper).toString();
    return password == hash_pw

}