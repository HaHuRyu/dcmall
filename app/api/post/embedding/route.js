import {getEmbedding} from "../../../util/openai-utils"
import {NextResponse} from "next/server"

export async function POST(req){
    const { searchText } = await req.json();

    const emtext = getEmbedding(searchText)

    return emtext;

}