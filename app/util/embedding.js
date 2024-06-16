// import * as tf from '@tensorflow/tfjs';
// import * as use from '@tensorflow-models/universal-sentence-encoder';

// let model = null;
// async function loadModel() {
//     if (!model)
//         model = await use.load();
// }

// export async function getEmbeddings(text) {
//     await loadModel();
//     const embedding = await model.embed([text]);
//     return embedding.arraySync();   //어찌저찌 값은 나오는데
// }

// export async function cosineSimilarity(vecA, vecB) {
//     if (!vecA || !vecB) {
//         throw new Error('Embeddings cannot be null');
//     }
//     const dotProduct = tf.dot(vecA, vecB);
//     const magnitudeA = tf.norm(vecA);
//     const magnitudeB = tf.norm(vecB);
//     const similarity = dotProduct.div(magnitudeA.mul(magnitudeB));
//     await console.log("최종: "+dotProduct+" // "+magnitudeA+" // "+magnitudeB+" // "+similarity);
//     return similarity.arraySync();
// }
