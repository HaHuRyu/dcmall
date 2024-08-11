import axios from 'axios';
import {supabase} from '../util/supabase';
import { NextResponse } from 'next/server';
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

  const embedding = response.data.data[0].embedding;

  // 테이블 이름을 큰따옴표로 묶어 대소문자를 구분
  const {data, error, status} = await supabase.rpc('search_items', {
    query_embedding: embedding,
    match_threshold: 0.1,
    match_count: 30
  })
  
  if (error) {
    console.error('Error:', error)
  } else {
    return NextResponse.json({recommendations: data}, {status: 200})
  }
  return NextResponse.json({recommendations: error}, {status: 400});
}
/* DB 내에서 자체적으로 계산이 진행되기 때문에 주석처리
export function cosineSimilarity(vecA, vecB) {  //코사인 유사도는 공식으로 바꿔봐야 크게 의미가 없다
  const dotProduct = vecA.reduce((sum, a, idx) => sum + a * vecB[idx], 0);
  const normA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const normB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));

  return dotProduct / (normA * normB);
}
*/


export default { getEmbedding };
