import axios from 'axios';
import {supabase} from '../util/supabase';
import { NextResponse } from 'next/server';
/*
240625 임베딩까지도 잘 계산하는데 DB 저장이 제대로 이뤄지지 않는 경우
*/
export async function getEmbedding(text, threshold) {
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
  let data, error, status;
  console.log("dsa" + threshold)
  if(threshold == "x") {
      const result = await supabase.rpc('search_items', {
        query_embedding: embedding,
        match_threshold: 0.1,
        match_count: 30
      });
      data = result.data;
      error = result.error;
  } else {
    const result = await supabase
    .from("notification")
    .upsert({ num: 4, embedding: embedding, threshold: threshold },
            { onConflict: ['num'] }
    )
    .select();

    data = result.data;
    error = result.error;
    status = result.status
      
  }


  if (error) {
    console.error('Error: ' + JSON.stringify(error))
  } else if(status == 200){
    return NextResponse.json({check: 200})
  } else {
    return NextResponse.json({recommendations: data})
  }
  return NextResponse.json({recommendations: error}, {status: 400});
}



export default { getEmbedding };
