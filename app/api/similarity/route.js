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
