import Redis from 'ioredis'

const redis = new Redis({
    host:process.env.REDIS_HOST,
    port:process.env.REDIS_PORT,
    password:process.env.REDIS_PASSWORD
})

export async function redisFullSize(){
    try{
        const length = await redis.dbsize();
        return length;
    }catch(error){
        console.error("Redis의 사이즈를 알아낼 수 없으삼");
        throw error;
    }
}

export async function getAllRecords() {
    let cursor = 0;
    const allRecords = []; // 데이터를 저장할 배열

    while (true) {
      const key = cursor.toString(); // 숫자 키를 문자열로 변환
      const value = await redis.get(key); // 해당 키의 값을 가져옴
    
      if (value === null) {
        // GET 결과가 null이면 더 이상 유효한 키가 없으므로 반복 종료
        break;
      }
      allRecords[key] = value; // 결과 객체에 저장
    
      cursor += 1; // 다음 키로 이동
    }

    return allRecords; // 배열 형태로 반환
}

export {redis};