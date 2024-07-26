import {getEmbedding} from "../../../util/openai-utils"
import {NextResponse} from "next/server"

export async function POST(req){
    const { searchText } = await req.json();

    console.log(searchText);

    const emtext = getEmbedding(searchText)

    console.log("testdsadsa" + emtext)

    return emtext;

}