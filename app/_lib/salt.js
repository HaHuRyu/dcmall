import crypto from 'crypto';
import CryptoJS from 'crypto-js';

let password
let pwdSalt

export function password_salt(userPw, salt = null){

    // 회원가입 시
    if(salt == null){
        let randombytes = crypto.randomBytes(3);
        let salt = randombytes.toString('hex')
    
        pwdSalt = userPw + salt;
    
        password = CryptoJS.SHA256(pwdSalt).toString() + salt;
    } else {
        pwdSalt = userPw+salt

        password = CryptoJS.SHA256(pwdSalt).toString();
    }
    
    return password
    
}