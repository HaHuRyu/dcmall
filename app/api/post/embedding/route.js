import {getEmbedding} from "../../../util/openai-utils"

export async function POST(req){
    const { searchText } = await req.json();

    return getEmbedding(searchText);
}