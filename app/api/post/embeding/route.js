import {getEmbedding, cosineSimilarity} from "../../../util/openai-utils"
import {NextResponse} from "next/server"

export async function POST(req){
    const text = await req.text();
    const params = new URLSearchParams(text);

    let searchText = params.get('searchText')

    console.log(searchText);

    const emtext = getEmbedding(searchText)

    return NextResponse.json({message : emtext}, {status : 300});

    //cosineSimilarity(em)

}