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
    try {
      const allRecords = {};
      let cursor = '0';
  
      do {
        // SCAN 명령으로 키 검색 (배치 단위로 가져옴)
        const [nextCursor, keys] = await redis.scan(cursor);
  
        // 각 키의 값을 가져와 기록
        for (const key of keys) {
          const value = await redis.get(key); // 키의 값을 가져옴
          allRecords[key] = value; // 결과 객체에 저장
        }
  
        cursor = nextCursor; // 다음 커서로 이동
      } while (cursor !== '0'); // 커서가 0이 되면 종료
  
      return allRecords;
    } catch (error) {
      console.error('Redis 레코드를 가져오는 중 오류 발생:', error);
      throw error;
    }
}

export {redis};