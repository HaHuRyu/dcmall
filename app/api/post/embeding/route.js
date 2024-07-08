import {getEmbedding, cosineSimilarity} from "../../../util/openai-utils"

export async function post(req){
    const emtext = getEmbedding("닭고기")

    cosineSimilarity(em)

}