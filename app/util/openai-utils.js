import axios from 'axios';

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

  console.log("SSSSSS: ",response.data.data[0].embedding);  //이 벡터 값을 저장해야 한다.
  return response.data.data[0].embedding;
}

export function cosineSimilarity(vecA, vecB) {  //코사인 유사도는 공식으로 바꿔봐야 크게 의미가 없다
  const dotProduct = vecA.reduce((sum, a, idx) => sum + a * vecB[idx], 0);
  const normA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const normB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));

  return dotProduct / (normA * normB);
}

export default { getEmbedding, cosineSimilarity };
