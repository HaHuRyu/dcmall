// import { getEmbeddings, cosineSimilarity } from '../../util/embedding';
 //import { NextResponse } from 'next/server';

// export async function POST(req) {
//     const { textA, textB } = await req.json();

//     if (!textA || !textB) {
//         return NextResponse.json({ message: 'Both textA and textB are required' }, { status: 400 });
//     }

//     try {
//         const embeddingsA = await getEmbeddings(textA);
//         const embeddingsB = await getEmbeddings(textB);
//         const similarity = await cosineSimilarity(embeddingsA[0], embeddingsB[0]);

//         const similarityPercentage = Math.round(similarity * 100); // 백분율로 변환
//         console.log("썩세스!!!!!!!!!!!!!!"+similarityPercentage);
//         return NextResponse.json({ similarity: similarityPercentage }, { status: 200 });
//     } catch (error) {
//         console.error('Error calculating similarity:', error);
//         return NextResponse.json({ message: 'An error occurred while calculating similarity' }, { status: 500 });
//     }
// }
import { NextResponse } from 'next/server';
import { getEmbedding, cosineSimilarity } from '../../util/openai-utils';

export async function POST(req) {
  try {
    const { textA, textB } = await req.json();

    if (!textA || !textB) {
      return NextResponse.json({ error: 'Both textA and textB are required' }, { status: 400 });
    }

    const [embeddingA, embeddingB] = await Promise.all([
      getEmbedding(textA),
      getEmbedding(textB)
    ]);

    const similarity = cosineSimilarity(embeddingA, embeddingB);
    const similarityPercentage = Math.round(similarity * 100);

    return NextResponse.json({ sim: similarityPercentage }, { status: 200 });
  } catch (error) {
    console.error('Error calculating similarity:', error);
    return NextResponse.json({ error: 'Failed to calculate similarity' }, { status: 500 });
  }
}
