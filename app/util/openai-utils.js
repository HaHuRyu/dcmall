import axios from 'axios';
import {supabase} from '../util/supabase';
/*
240625 임베딩까지도 잘 계산하는데 DB 저장이 제대로 이뤄지지 않는 경우
*/
export async function getEmbedding(text) {
  const response = await axios.post(
    'https://api.openai.com/v1/embeddings',
    {
      model: 'text-embedding-3-small',
      input: text,
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPEN_API_KEY}`,
      },
    }
  );

  try {
    const embedding = response.data.data[0].embedding;

    // 테이블 이름을 큰따옴표로 묶어 대소문자를 구분
    const { error } = await supabase.from('"embedTable"').insert([
      { title: text, embedding: embedding }
    ]);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error("임베딩 저장 시도 실패: " + error.message);
  }
  
  return response.data.data[0].embedding;
}

export function cosineSimilarity(vecA, vecB) {  //코사인 유사도는 공식으로 바꿔봐야 크게 의미가 없다
  const dotProduct = vecA.reduce((sum, a, idx) => sum + a * vecB[idx], 0);
  const normA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const normB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));

  return dotProduct / (normA * normB);
}

export default { getEmbedding, cosineSimilarity };
